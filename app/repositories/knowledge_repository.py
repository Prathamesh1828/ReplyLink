from app.services.supabase_service import supabase


class KnowledgeRepository:
    """
    Handles all database operations for the knowledge_base table.
    """

    @staticmethod
    def get_all_by_user(user_id: str):
        response = (
            supabase
            .table("knowledge_base")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        return response.data

    @staticmethod
    def get_by_id(knowledge_id: str):
        response = (
            supabase
            .table("knowledge_base")
            .select("*")
            .eq("id", knowledge_id)
            .single()
            .execute()
        )

        return response.data

    @staticmethod
    def get_by_id_for_user(
        knowledge_id: str,
        user_id: str
    ):
        response = (
            supabase
            .table("knowledge_base")
            .select("*")
            .eq("id", knowledge_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        return response.data

    @staticmethod
    def create(data: dict):
        response = (
            supabase
            .table("knowledge_base")
            .insert(data)
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    @staticmethod
    def update(
        knowledge_id: str,
        data: dict
    ):
        response = (
            supabase
            .table("knowledge_base")
            .update(data)
            .eq("id", knowledge_id)
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    @staticmethod
    def delete(knowledge_id: str):
        response = (
            supabase
            .table("knowledge_base")
            .delete()
            .eq("id", knowledge_id)
            .execute()
        )

        return len(response.data) > 0

    @staticmethod
    def find_exact_answer(
        user_id: str,
        question: str
    ):
        response = (
            supabase
            .table("knowledge_base")
            .select("*")
            .eq("user_id", user_id)
            .ilike("question", question)
            .limit(1)
            .execute()
        )

        if response.data:
            return response.data[0]

        return None

    @staticmethod
    def semantic_search(
        user_id: str,
        query_embedding: list[float],
        limit: int = 5
    ):
        response = (
            supabase
            .rpc(
                "match_knowledge",
                {
                    "input_user_id": user_id,
                    "query_embedding": query_embedding,
                    "match_count": limit
                }
            )
            .execute()
        )

        return response.data