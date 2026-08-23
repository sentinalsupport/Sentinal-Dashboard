import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest){
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("session","",{ httpOnly:true, path:"/", maxAge:0 });
  return res;
}
export async function POST(req: NextRequest){
  const res = NextResponse.json({ok:true});
  res.cookies.set("session","",{ httpOnly:true, path:"/", maxAge:0 });
  return res;
}
