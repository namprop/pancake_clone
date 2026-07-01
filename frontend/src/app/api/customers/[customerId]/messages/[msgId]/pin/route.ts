import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ customerId: string; msgId: string }> }
) {
  try {
    await connectDB();
    const { customerId, msgId } = await context.params;
    
    // Find customer and toggle pin status for the specific message
    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }
    
    const messageIndex = customer.chatHistory.findIndex((m: any) => m.id === msgId);
    if (messageIndex === -1) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }
    
    customer.chatHistory[messageIndex].isPinned = !customer.chatHistory[messageIndex].isPinned;
    await customer.save();
    
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
