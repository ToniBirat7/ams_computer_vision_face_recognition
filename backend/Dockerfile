FROM python:3.11-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libgomp1 libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

# CPU-only torch — prevents 2GB CUDA wheel from being pulled
RUN pip install --no-cache-dir \
    torch==2.2.2+cpu torchvision==0.17.2+cpu torchaudio==2.2.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# headless opencv — no GUI/display dependencies
RUN pip install --no-cache-dir opencv-python-headless==4.11.0.86

# remaining deps — torch/opencv already satisfied, pip skips them
COPY requirements.txt .
RUN grep -vE "^torch|^torchvision|^torchaudio|^opencv-python" requirements.txt \
    | pip install --no-cache-dir -r /dev/stdin


FROM python:3.11-slim AS runtime
WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=builder /usr/local/bin /usr/local/bin

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libgomp1 libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN chmod +x entrypoint.sh

ENV MPLBACKEND=Agg \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
