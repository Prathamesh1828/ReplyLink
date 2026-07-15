from app.services.indexing_service import (
    index_knowledge_base,
)

from app.utils.helper import (
    DEMO_USER_ID,
)

index_knowledge_base(
    DEMO_USER_ID
)