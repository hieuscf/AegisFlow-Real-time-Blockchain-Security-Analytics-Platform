package parser

import (
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"aegisflow/indexer/internal/models"
)

// Minimal Uniswap V2 ABI for PairCreated and Swap events.
// Swap topic0 = keccak256("Swap(address,uint256,uint256,uint256,uint256,address)")
// → 0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822
const uniswapV2ABIJSON = `[
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "Swap",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "token0", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "token1", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "pair", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "PairCreated",
    "type": "event"
  }
]`

var (
	uniswapABI     abi.ABI
	swapEventID    common.Hash
	pairCreatedID  common.Hash
	swapEvent      abi.Event
	pairCreatedEvt abi.Event
)

func init() {
	parsed, err := abi.JSON(strings.NewReader(uniswapV2ABIJSON))
	if err != nil {
		panic(fmt.Sprintf("parse uniswap abi: %v", err))
	}
	uniswapABI = parsed

	var ok bool
	swapEvent, ok = uniswapABI.Events["Swap"]
	if !ok {
		panic("swap event not found in abi")
	}
	pairCreatedEvt, ok = uniswapABI.Events["PairCreated"]
	if !ok {
		panic("paircreated event not found in abi")
	}

	swapEventID = swapEvent.ID
	pairCreatedID = pairCreatedEvt.ID
}

// SwapEventID returns the keccak256 hash for the Uniswap V2 Swap event.
func SwapEventID() common.Hash {
	return swapEventID
}

// PairCreatedEventID returns the keccak256 hash for the Uniswap V2 PairCreated event.
func PairCreatedEventID() common.Hash {
	return pairCreatedID
}

// ParseSwapLog decodes a Swap log into a SwapEvent using the Uniswap V2 ABI.
func ParseSwapLog(log types.Log) (*models.SwapEvent, error) {
	if len(log.Topics) == 0 || log.Topics[0] != swapEventID {
		return nil, fmt.Errorf("log is not a Swap event")
	}

	vals, err := uniswapABI.Unpack(swapEvent.Name, log.Data)
	if err != nil {
		return nil, fmt.Errorf("unpack swap data: %w", err)
	}

	if len(vals) != 4 {
		return nil, fmt.Errorf("unexpected swap non-indexed field count: %d", len(vals))
	}

	amount0In, err := toBigInt(vals[0])
	if err != nil {
		return nil, err
	}
	amount1In, err := toBigInt(vals[1])
	if err != nil {
		return nil, err
	}
	amount0Out, err := toBigInt(vals[2])
	if err != nil {
		return nil, err
	}
	amount1Out, err := toBigInt(vals[3])
	if err != nil {
		return nil, err
	}

	if len(log.Topics) < 3 {
		return nil, fmt.Errorf("swap log missing indexed topics")
	}

	sender := common.BytesToAddress(log.Topics[1].Bytes())
	// to := common.BytesToAddress(log.Topics[2].Bytes()) — available if needed later

	return &models.SwapEvent{
		TxHash:      log.TxHash.Hex(),
		PairAddress: log.Address.Hex(),
		Sender:      sender.Hex(),
		Amount0In:   amount0In.String(),
		Amount1In:   amount1In.String(),
		Amount0Out:  amount0Out.String(),
		Amount1Out:  amount1Out.String(),
		BlockNumber: log.BlockNumber,
	}, nil
}

// PairCreated holds decoded PairCreated event fields.
type PairCreated struct {
	Token0 common.Address
	Token1 common.Address
	Pair   common.Address
}

// ParsePairCreatedLog decodes a PairCreated log from the Uniswap V2 Factory.
func ParsePairCreatedLog(log types.Log) (*PairCreated, error) {
	if len(log.Topics) == 0 || log.Topics[0] != pairCreatedID {
		return nil, fmt.Errorf("log is not a PairCreated event")
	}

	if len(log.Topics) < 3 {
		return nil, fmt.Errorf("paircreated log missing indexed topics")
	}

	token0 := common.BytesToAddress(log.Topics[1].Bytes())
	token1 := common.BytesToAddress(log.Topics[2].Bytes())

	vals, err := uniswapABI.Unpack(pairCreatedEvt.Name, log.Data)
	if err != nil {
		return nil, fmt.Errorf("unpack paircreated data: %w", err)
	}
	if len(vals) < 1 {
		return nil, fmt.Errorf("paircreated log missing pair address in data")
	}

	pairAddr, ok := vals[0].(common.Address)
	if !ok {
		return nil, fmt.Errorf("pair address type assertion failed")
	}

	return &PairCreated{
		Token0: token0,
		Token1: token1,
		Pair:   pairAddr,
	}, nil
}

func toBigInt(v interface{}) (*big.Int, error) {
	n, ok := v.(*big.Int)
	if !ok || n == nil {
		return nil, fmt.Errorf("expected *big.Int, got %T", v)
	}
	return n, nil
}
