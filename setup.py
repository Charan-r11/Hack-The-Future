from setuptools import setup, find_packages

setup(
    name="masumi-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "python-multipart",
        "aiohttp",
        "python-dotenv",
        "PyPDF2",
        "tiktoken",
        "openai"
    ],
    python_requires=">=3.8",
    author="Masumi AI",
    description="Backend services for Masumi AI document processing",
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
) 