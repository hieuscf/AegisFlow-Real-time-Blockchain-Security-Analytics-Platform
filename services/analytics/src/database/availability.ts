let postgresAvailable = false;

export function setPostgresAvailable(available: boolean): void {
  postgresAvailable = available;
}

export function isPostgresAvailable(): boolean {
  return postgresAvailable;
}
