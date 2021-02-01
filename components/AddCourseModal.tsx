import { useState, useRef } from "react"
import { Button, Form, Modal } from "react-bootstrap"

interface Props {
    callback: (semester: string, name: string, points: number, grade: number) => void
}

const AddCourseModal: React.FC<Props> = ({ callback }) => {
    const [show, setShow] = useState(false)

    const open = () => setShow(true)
    const close = () => setShow(false)

    const semester = useRef<HTMLInputElement>()
    const name = useRef<HTMLInputElement>()
    const points = useRef<HTMLInputElement>()
    const grade = useRef<HTMLInputElement>()

    const submit = () => {
        close()
        callback(semester.current.value, name.current.value, Number(points.current.value), Number(grade.current.value))
    }

    return (
        <div>
            <div className="text-center">
                <Button className="mb-2" onClick={open}>Add</Button>
            </div>
            <br />

            <Form>
                <Modal show={show} onHide={close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Course</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="semester">
                            <Form.Label>Semester</Form.Label>
                            <Form.Control type="text" ref={semester} />
                        </Form.Group>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" ref={name} />
                        </Form.Group>
                        <Form.Group controlId="points">
                            <Form.Label>Points</Form.Label>
                            <Form.Control type="number" ref={points} />
                        </Form.Group>
                        <Form.Group controlId="grade">
                            <Form.Label>Grade</Form.Label>
                            <Form.Control type="number" min={0} max={100} ref={grade} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={submit}>
                            Add
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Form>

        </div>
    )
}

export default AddCourseModal