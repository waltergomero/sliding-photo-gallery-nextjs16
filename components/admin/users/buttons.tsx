'use client';
import React, {useState} from "react";
import Link from "next/link";
import { deleteUser } from "@/actions/user-actions";
import {  TbEdit, TbTrash, TbPlus, TbCircle} from 'react-icons/tb';
import { Button, Modal } from "react-bootstrap";

interface UsersButtonProps {
  id: string;
}

export function DeleteUserBtn({ id }: UsersButtonProps) {
  const deleteUserWithId = deleteUser.bind(null, id);
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Button
        variant="danger"
        className="btn-icon rounded-circle"
        type="button"
        title="Delete User"
        aria-label={`Delete user ${id}`}
        onClick={() => setShowModal(true)}
      >
        <TbTrash className="fs-lg" />
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" className="btn-sm" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <form action={deleteUserWithId} className="d-inline">
            <Button variant="danger" className="btn-sm" type="submit" onClick={() => setShowModal(false)}>
              Delete
            </Button>
          </form>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function CreateUserBtn() {
  return (
    <Link href="/admin/users/create" className="btn btn-primary">
      <span className="hidden md:block">Add New User</span>{" "}
      <TbPlus size={24} />
    </Link>
  );
}

export function EditUserBtn({ id }: UsersButtonProps) {
  return (
    <Link href={`/admin/users/${id}`}>
      <Button 
        variant="outline-primary" 
        size="sm" 
        className="btn-icon rounded-circle"
        title="Edit User"
        aria-label={`Edit user ${id}`}
      >
        <TbEdit className="fs-lg" />
      </Button>
    </Link>
  );
}

export function CancelUserBtn() {
  return (
    <Link
      href="/admin/user"
      className="flex h-10 items-center rounded-lg bg-gray-400 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
    >
      <span className="hidden md:block">Cancel</span>{" "}
      <TbCircle className="h-6 md:ml-4" />
    </Link>
  );
}

export function SaveUserBtn() {
  return (
    <Button type="submit" variant="primary">Save User Information
      <TbPlus size={24} />
    </Button>
  );
}