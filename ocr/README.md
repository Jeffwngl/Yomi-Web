# Backend development

Start the backend from this directory with `uvicorn main:app --reload` or `python run_backend.py`. Keep the server bound to `127.0.0.1`.

The backend prints a randomly generated OCR token at startup. Copy it into the **Backend token** field in the extension popup. By default the token changes whenever the backend restarts, including development reloads. Set the `YOMI_OCR_TOKEN` environment variable to a strong random value before starting the backend if you want the token to persist across restarts. Reload the extension after updating its permissions.

The API requires `Authorization: Bearer <token>`. Requests run from the extension background script; arbitrary webpage origins are not granted CORS access.

Uploads are limited to 10 MiB including multipart overhead. Images are limited to 16 million pixels and 8192 pixels per dimension; textbox captures are limited to 1200 pixels per dimension. One inference runs at a time, and overlapping requests receive HTTP 429. The extension times out requests after 60 seconds. Canceling a request prevents results from appearing, but inference already executing on the server may finish before the server is available again.

Scrolling, resizing, switching away from the page, clearing, or starting a new selection invalidates pending results and removes existing overlays. Select the region again after moving the page.

Run backend request tests without loading OCR models:

```sh
.venv/bin/python -B -m unittest discover -s tests -v
```

These tests use the installed FastAPI/Pillow stack and substitute model inference. They do not test OCR accuracy or browser interactions.
