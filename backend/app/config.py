from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "CampusFind API"
    database_url: str = "postgresql+psycopg://campusfind:campusfind@localhost:5432/campusfind"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
