import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";

export async function GET(req: NextRequest) {
  // Not used directly anymore, tags are embedded in Customer
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { customerId, tags, syncByCustomer } = await req.json();

    if (!customerId || !Array.isArray(tags)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 });
    }

    // Upsert the customer's tags in the database
    const targetCustomer = await Customer.findOne({ id: customerId });
    if (!targetCustomer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const targetPhone = targetCustomer.phone;

    if (syncByCustomer && targetPhone) {
      // Sync tags to all customers with the same phone number
      await Customer.updateMany(
        { phone: targetPhone },
        { $set: { tags } }
      );
    } else {
      // Update only this specific conversation/customer
      await Customer.findOneAndUpdate(
        { id: customerId },
        { $set: { tags } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
