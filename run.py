import os
import sys
from pathlib import Path

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.append(project_root)

import uvicorn

if __name__ == "__main__":
    uvicorn.run("Backend.main:app", host="0.0.0.0", port=8005, reload=True) 