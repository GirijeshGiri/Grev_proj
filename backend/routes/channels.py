from fastapi import APIRouter
from schemas import ChannelsResponse
from services.channel_service import ChannelService

router = APIRouter(prefix="/api/channels", tags=["Official Channels"])


@router.get("", response_model=ChannelsResponse, summary="List verified official government portals")
async def list_official_channels():
    """Returns the verified directory of official Indian government submission portals."""
    channels = ChannelService.get_all_channels()
    return ChannelsResponse(count=len(channels), channels=channels)
