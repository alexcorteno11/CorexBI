
from sqlalchemy import select
from sqlalchemy.exc import OperationalError

from app.database import engine
from app.models import Product


def main():
    if engine.dialect.name != "postgresql":
        raise RuntimeError(
            "This test must run against PostgreSQL"
        )

    with engine.connect() as connection:
        product_id = connection.scalar(
            select(Product.id)
            .where(
                Product.name
                == "CorexBI - Prueba de Concurrencia"
            )
            .order_by(Product.id.desc())
            .limit(1)
        )

    if product_id is None:
        raise RuntimeError(
            "Concurrency test product not found"
        )

    print(f"Testing product ID: {product_id}")

    with engine.connect() as connection_a:
        with engine.connect() as connection_b:

            try:

                product_a = connection_a.execute(
                    select(Product.id)
                    .where(Product.id == product_id)
                    .with_for_update()
                ).scalar_one()

                print(
                    f"Transaction A locked product {product_a}"
                )

                try:
                    connection_b.execute(
                        select(Product.id)
                        .where(Product.id == product_id)
                        .with_for_update(nowait=True)
                    ).scalar_one()

                except OperationalError as error:
                    sqlstate = getattr(
                        error.orig,
                        "sqlstate",
                        None,
                    ) or getattr(
                        error.orig,
                        "pgcode",
                        None,
                    )

                    if sqlstate != "55P03":
                        raise

                    print(
                        "Transaction B correctly blocked "
                        "(SQLSTATE 55P03)"
                    )

                    connection_b.rollback()

                else:
                    raise AssertionError(
                        "Transaction B acquired a lock "
                        "while A was holding it"
                    )

                connection_a.rollback()

                print("Transaction A released the lock")

                product_b = connection_b.execute(
                    select(Product.id)
                    .where(Product.id == product_id)
                    .with_for_update(nowait=True)
                ).scalar_one()

                assert product_b == product_id

                print(
                    "Transaction B acquired the lock "
                    "after A released it"
                )

                connection_b.rollback()

                print(
                    "SUCCESS: PostgreSQL row locking works"
                )

            finally:

                connection_b.rollback()
                connection_a.rollback()


if __name__ == "__main__":
    main()
