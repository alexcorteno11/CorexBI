import json

from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from urllib.request import Request, urlopen
from urllib.error import HTTPError

BASE_URL = "http://127.0.0.1:8000"


def send_requests(method, path, payload=None):
    data = (
        json.dumps(payload).encode("utf-8")
        if payload is not None
        else None
    )

    request = Request(
        BASE_URL + path,
        data=data,
        headers={"Content-Type": "application/json"},
        method=method,
    )

    try:
        with urlopen(request, timeout=15) as response:
            return (
                response.status,
                json.loads(response.read()),
            )
    except HTTPError as error:
        return (
            error.code,
            json.loads(error.read()),
        )


def main():
    status, product = send_requests(
        "POST",
        "/products",
        {
            "name": "CorexBI - Prueba de Concurrencia",
            "category": "Pruebas",
            "price": "100.00",
            "stock": 1,
        },
    )

    assert status == 201, (status, product)

    product_id = product["id"]
    print(f"Producto de prueba: ID {product_id}")
    print("Stock inicial : 1")

    barrier = Barrier(2)

    def buy_product():
        barrier.wait()

        return send_requests(
            "POST",
            "/sales",
            {
                "items": [
                    {
                        "product_id": product_id,
                        "quantity": 1,
                    }
                ]
            },
        )

    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [
            executor.submit(buy_product)
            for _ in range(2)
        ]

        results = [
            future.result()
            for future in futures
        ]

    for i, (code, body) in enumerate(results, start=1):
        print(f"Cliente {i}: HTTP {code}")
        print(body)

    codes = sorted(code for code, _ in results)

    assert codes == [201, 409], (
        f"Resultados inesperados: {codes}"
    )

    status, product = send_requests(
        "GET",
        f"/products/{product_id}",
    )

    assert status == 200, (status, product)
    assert product["stock"] == 0, product

    print(f"Stock final: {product['stock']}")
    print("PRUEBA EXITOSA: una venta y un rechazo.")


if __name__ == "__main__":
    main()
