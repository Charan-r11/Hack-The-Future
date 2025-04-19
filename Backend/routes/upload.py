from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        # Here you would typically save the file or process it
        return JSONResponse(
            status_code=200,
            content={"message": f"File {file.filename} uploaded successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error uploading file: {str(e)}"}
        )
