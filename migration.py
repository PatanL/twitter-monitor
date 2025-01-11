from solana.rpc.websocket_api import connect
import asyncio

MIGRATION_ADDRESS = "39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg"

async def monitor_migrations():
    async with connect("wss://api.mainnet-beta.solana.com") as websocket:
        await websocket.program_subscribe(
            MIGRATION_ADDRESS,
            encoding="jsonParsed",
            commitment="confirmed"
        )
        
        while True:
            try:
                msg = await websocket.recv()
                if "initialize2" in str(msg):
                    print(f"Migration detected: {msg}")
            except Exception as e:
                print(f"Error: {e}")
                continue

if __name__ == "__main__":
    asyncio.run(monitor_migrations())
