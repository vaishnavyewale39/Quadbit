# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AURA Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
