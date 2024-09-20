"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Trash2, Edit2, Check } from "lucide-react";
import axios from "axios";
import { toast, useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const Todos = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [urgency, setUrgency] = useState("Medium");
  const [todos, setTodos] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState<string | null>(null);
  const [editUrgency, setEditUrgency] = useState("Medium");
  const { toast } = useToast();

  const handleTodos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate, urgency }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setDueDate(null);
        setUrgency("Medium");
        fetchTodos();
      } else {
        console.error("Failed to create todo");
      }
    } catch (error) {
      console.error("Something went wrong:", error);
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await axios.get("/api/todos");
      setTodos(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await axios.delete(`/api/todos?id=${id}`);
      if (res.status === 200) {
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete todo:", e);
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (!todoToUpdate) {
        console.error("Todo not found");
        return;
      }

      const updatedTodo = {
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
      };

      const res = await axios.put(`/api/todos?id=${id}`, updatedTodo);
      if (res.status === 200) {
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
      }
    } catch (e) {
      console.error("Failed to update todo:", e);
    }
  };

  const startEditing = (todo: any) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditDueDate(todo.dueDate);
    setEditUrgency(todo.urgency);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate(null);
    setEditUrgency("Medium");
  };

  const saveEdit = async (id: string) => {
    try {
      const updatedTodo = {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        urgency: editUrgency,
      };

      const res = await axios.put(`/api/todos?id=${id}`, updatedTodo);
      if (res.status === 200) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, ...updatedTodo } : todo
          )
        );
        cancelEditing();
      }
    } catch (e) {
      console.error("Failed to update todo:", e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Create New Todo</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTodos} className="space-y-4">
            <Input
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <ReactQuill
              value={description}
              onChange={setDescription}
              placeholder="Description..."
            />
            <Input
              type="date"
              value={dueDate || ""}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Due Date"
            />
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full border p-2 rounded-md"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <Button
              type="submit"
              className="w-full"
              onClick={async (e) => {
                await handleTodos(e);
                toast({
                  title: "Todo added",
                  variant: "default",
                  duration: 3000,
                  style: {
                    backgroundColor: "green",
                    color: "white",
                  },
                });
              }}
            >
              Create Todo
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Todo List</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {todos.map((todo: any) => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
              >
                {editingId === todo.id ? (
                  <div className="flex-grow space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Edit title..."
                    />
                    <ReactQuill
                      value={editDescription}
                      onChange={setEditDescription}
                      placeholder="Edit description..."
                    />
                    <Input
                      type="date"
                      value={editDueDate || ""}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      placeholder="Edit Due Date"
                    />
                    <select
                      value={editUrgency}
                      onChange={(e) => setEditUrgency(e.target.value)}
                      className="w-full border p-2 rounded-md"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                ) : (
                  <div
                    className={`flex-grow ${todo.completed ? "line-through text-gray-500" : ""}`}
                  >
                    <h3 className="font-semibold">{todo.title}</h3>
                    <p
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: todo.description }}
                    ></p>
                    <p className="text-sm text-gray-500">
                      Due:{" "}
                      {todo.dueDate
                        ? new Date(todo.dueDate).toLocaleDateString()
                        : "No due date"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Urgency: {todo.urgency}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2">
                  {editingId === todo.id ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => saveEdit(todo.id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Check size={20} />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => startEditing(todo)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => toggleComplete(todo.id)}
                    className={
                      todo.completed
                        ? "text-green-500"
                        : "text-gray-500 hover:text-green-500"
                    }
                  >
                    <Check size={20} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Todos;
