from app.database import Base, engine
from app import models


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas o verificadas correctamente.")

    print("Tablas disponibles:")
    for table_name in Base.metadata.tables:
        print(f"- {table_name}")


if __name__ == "__main__":
    create_tables()
