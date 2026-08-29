def response(service: str, data: dict, success: bool = True):
    return {
        "success": success,
        "service": service,
        "data": data,
    }


def success_response(service: str, data: dict):
    return response(service, data, success=True)


def error_response(service: str, message: str, error_code: str = "SERVICE_ERROR"):
    return {
        "success": False,
        "service": service,
        "error": {
            "code": error_code,
            "message": message,
        }
    }