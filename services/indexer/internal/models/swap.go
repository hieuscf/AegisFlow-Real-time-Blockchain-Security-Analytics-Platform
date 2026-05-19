package models

// SwapEvent represents a decoded Uniswap V2 Swap log ready for JSON serialization.
type SwapEvent struct {
	TxHash      string `json:"txHash"`
	PairAddress string `json:"pairAddress"`
	Token0      string `json:"token0"`
	Token1      string `json:"token1"`
	Sender      string `json:"sender"`
	Amount0In   string `json:"amount0In"`
	Amount1In   string `json:"amount1In"`
	Amount0Out  string `json:"amount0Out"`
	Amount1Out  string `json:"amount1Out"`
	BlockNumber uint64 `json:"blockNumber"`
	Timestamp   uint64 `json:"timestamp"`
}
