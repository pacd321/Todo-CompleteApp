import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all todos for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todos = await prisma.todos.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        completed: true,
        dueDate: true, // Include dueDate in response
        urgency: true, // Include urgency in response
      },
    });

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST: Create a new todo
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, dueDate, urgency } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTodo = await prisma.todos.create({
      data: {
        title,
        description,
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : null, // Store dueDate if provided
        urgency: urgency || "Medium", // Default urgency to "Medium" if not provided
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(newTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing todo
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const todoId = url.searchParams.get("id");

    if (!todoId) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const todo = await prisma.todos.findUnique({
      where: { id: parseInt(todoId) },
    });

    if (!todo || todo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Todo not found or unauthorized" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, description, completed, dueDate, urgency } = body;

    const updatedTodo = await prisma.todos.update({
      where: { id: parseInt(todoId) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(dueDate !== undefined && {
          dueDate: dueDate
            ? { set: new Date(dueDate).toISOString() }
            : { set: null },
        }),
        ...(urgency !== undefined && { urgency }), // Update urgency if provided
      },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const todoId = url.searchParams.get("id");

    if (!todoId) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const todo = await prisma.todos.findUnique({
      where: { id: parseInt(todoId) },
    });

    if (!todo || todo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Todo not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.todos.delete({
      where: { id: parseInt(todoId) },
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
