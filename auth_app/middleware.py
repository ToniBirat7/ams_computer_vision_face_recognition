from channels.middleware import BaseMiddleware

class WebSocketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Add debugging
        print(f"WebSocket connection attempt to path: {scope['path']}")
        return await super().__call__(scope, receive, send) 