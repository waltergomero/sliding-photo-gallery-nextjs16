import {useState} from "react";
import Link from "next/link";
import {  TbEdit,  TbTrash, TbPlus, TbCancel } from 'react-icons/tb';
import { deleteImageFromGallery, } from "@/actions/gallery-actions";
import { Button, Modal } from "react-bootstrap";

type DeleteImageBtnProps = {
  image_id: string;
  image_src: string;
  public_id: string;
  onDelete?: () => void;
};
export function DeleteImageBtn({ image_id, image_src, public_id, onDelete }: DeleteImageBtnProps) {
  const [showModal, setShowModal] = useState(false);
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    await deleteImageFromGallery(image_id, image_src, public_id);
    setShowModal(false);
    if (onDelete) onDelete();
  };
  return (
    <>
      <Button
        variant="danger"
        className="btn-icon rounded-circle" type="button"  style={{ top: 10, right: 10, zIndex: 2, position: 'absolute'}} 
        title="Delete Image"
        aria-label={`Delete image ${image_id}`}
        onClick={() => setShowModal(true)}
      >
        <TbTrash className="fs-lg" />
      </Button>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this image?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" className="btn-sm" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <form className="d-inline" onSubmit={handleDelete}>
            <Button variant="danger" className="btn-sm" type="submit">
              Delete
            </Button>
          </form>
        </Modal.Footer>
      </Modal>
    </>
  );
}


export function EditImageBtn({onClick}: {id: string, onClick?: () => void}) {
  return (
    <Button
      variant="dark"
      className="btn-icon rounded-circle"
      type="button"
      style={{ top: 50, right: 10, zIndex: 2, position: 'absolute'}}
      onClick={onClick}
    >
      <TbEdit />
    </Button>
  );
}


export function SaveImageBtn() {
  return (
    <Button type="submit"
    className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      <span className="hidden md:block">Save Images</span>
      <TbPlus />
    </Button>
  );
}

export function CancelUpdateBtn() {
  return (
    <Link
      href="/admin/gallery"
      className="flex h-10 items-center rounded-lg bg-gray-400 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
    >
      <span className="hidden md:block">Cancel</span>{" "}
      <TbCancel />
    </Link>
  );
}
