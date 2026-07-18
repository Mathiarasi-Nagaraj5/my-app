import { NextResponse } from "next/server";

export const ApiResponse = {
  success(data: unknown, message = "Success", status = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  },

  error(message = "Something went wrong", status = 500) {
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  },
};