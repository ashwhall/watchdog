FROM condaforge/miniforge3:latest

# Install system dependencies required for PyTorch and common Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    git && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# First, copy only the files needed for dependency installation
COPY environment.yml .
COPY requirements.txt .
COPY setup.py .

# Create a minimal package structure for setup.py to work
RUN mkdir -p watchdog && touch watchdog/__init__.py

# Create conda environment (this will install deps + editable package)
RUN mamba env create -f environment.yml

RUN mamba install -c conda-forge huggingface_hub

RUN pip install -r requirements.txt

# Activate environment
ENV PATH="/opt/conda/envs/$(head -1 environment.yml | cut -d' ' -f2)/bin:$PATH"

# Make Python stdout/stderr unbuffered globally
ENV PYTHONUNBUFFERED=1

COPY . .

CMD ["python", "watchdog/run.py"]
