from setuptools import setup, find_packages

setup(
    name="observiq-sdk",
    version="0.1.0",
    description="ObservIQ Python SDK — AI Application Monitoring",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0",
    ],
    python_requires=">=3.9",
)