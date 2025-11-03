'use client'
import React, { useState } from "react";
import Link from "next/link";
import { deleteStatus } from "@/actions/status-actions";
import { Button, Modal} from "react-bootstrap";
import {  TbEdit, TbTrash, TbPlus, TbCircle} from 'react-icons/tb';

interface StatusButtonProps {
  id: string;
}

export function CreateStatusBtn() {
  return (
    <Link href="/admin/status/create" className="btn btn-primary">
      <span className="hidden md:block">Add New Status</span>{" "}
      <TbPlus size={24} />
    </Link>
  );
}

export function EditStatusBtn({ id }: StatusButtonProps) {
  return (
    <Link
      href={`/admin/status/${id}`}>
    <Button variant="light" size="sm" className="btn-icon rounded-circle">
        <TbEdit className="fs-lg" />
    </Button>
    </Link>
  );
}

export function DeleteStatusBtn({ id }: StatusButtonProps) {
  const deleteStatusWithId = deleteStatus.bind(null, id);
    const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Button
        variant="danger"
        className="btn-icon rounded-circle"
        type="button"
        title="Delete status"
        aria-label={`Delete status ${id}`}
        onClick={() => setShowModal(true)}
      >
        <TbTrash className="fs-lg" />
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this status?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" className="btn-sm"  onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <form action={deleteStatusWithId} className="d-inline">
            <Button variant="danger" className="btn-sm" type="submit" onClick={() => setShowModal(false)}>
              Delete
            </Button>
          </form>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function CancelStatusBtn() {
  return (
    <Link
      href="/admin/status"
      className="flex h-10 items-center rounded-lg bg-gray-400 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
    >
      <span className="hidden md:block">Cancel</span>{" "}
      <TbCircle className="h-6 md:ml-4" />
    </Link>
  );
}

type SaveStatusBtnProps = {
  loading?: boolean;
};

export const SaveStatusBtn = ({ loading }: SaveStatusBtnProps) => (
  <Button type="submit" className="btn btn-primary" disabled={loading}>
    {loading ? 'Saving...' : 'Save'}
  </Button>
);