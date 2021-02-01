import { ChangeEvent } from "react"
import { useEffect, useReducer, useRef } from "react"
import { Table, Button, Row, Card } from "react-bootstrap"
import AddCourseModal from "../components/AddCourseModal"

interface Course {
    name: string
    points: number
    grade: number
    ignored: boolean
}

interface Semester {
    name: string
    ignored: boolean
    courses: Course[]
}

interface State {
    semesters: Semester[]
}

abstract class Action { }

class AddCourse extends Action {
    semester: string
    name: string
    points: number
    grade: number

    constructor(semester: string, name: string, points: number, grade: number) {
        super()
        this.semester = semester
        this.name = name
        this.points = points
        this.grade = grade
    }
}

class Set extends Action {
    state: State

    constructor(state: State) {
        super()
        this.state = state
    }
}

class IgnoreSemester extends Action {
    semester: Semester

    constructor(semester: Semester) {
        super()
        this.semester = semester
    }
}

class IgnoreCourse extends Action {
    course: Course

    constructor(course: Course) {
        super()
        this.course = course
    }
}

const reducer = (state: State, action: Action) => {
    if (action instanceof AddCourse) {
        if (action.name === "" || action.semester === "") return state

        const course = {
            name: action.name,
            points: action.points,
            grade: action.grade,
            ignored: false,
        }

        const semester = state.semesters.find(semester => semester.name === action.semester)
        if (!semester) {
            state.semesters.push({
                name: action.semester,
                ignored: false,
                courses: [course],
            })
        }
        else semester.courses.push(course)
        return { ...state }
    } else if (action instanceof Set) {
        return action.state
    } else if (action instanceof IgnoreSemester) {
        const semester = state.semesters.find(s => s.name === action.semester.name)
        if (semester === undefined) return
        semester.ignored = !semester.ignored
        return { ...state }
    } else if (action instanceof IgnoreCourse) {
        const semester = state.semesters.find(s => s.courses.includes(action.course))
        if (semester === undefined) return
        const course = semester.courses.find(c => c.name === action.course.name)
        course.ignored = !course.ignored
        return { ...state }
    }
}

const Home = () => {
    const [state, dispatch] = useReducer(reducer, { semesters: [] })

    let overallPointSum = 0, overallGradeSum = 0, overallCourseCount = 0
    for (const semester of state.semesters) {
        if (semester.ignored) continue
        for (const course of semester.courses) {
            if (course.ignored) continue
            overallPointSum += course.points
            overallGradeSum += course.grade * course.points
            overallCourseCount++
        }
    }
    const overallAverage = overallGradeSum / overallPointSum

    const add = (semester: string, name: string, points: number, grade: number) => {
        dispatch(new AddCourse(semester, name, points, grade))
    }

    const fileInput = useRef<HTMLInputElement>()
    const saveButton = useRef<HTMLAnchorElement>()

    useEffect(() => {
        const file = JSON.stringify(state, undefined, 2) // Pretty Stringify
        const blob = new Blob([file], {
            type: "application/json"
        })
        const url = URL.createObjectURL(blob)
        saveButton.current.href = url
    })

    const open = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files[0]
        if (file === undefined) return
        if (file.type !== "application/json") return
        const text = await file.text()

        dispatch(new Set(JSON.parse(text)))
    }

    const ignoreCourse = (course: Course) => dispatch(new IgnoreCourse(course))
    const ignoreSemester = (semester: Semester) => dispatch(new IgnoreSemester(semester))

    return (
        <div className="container vh-100">
            <div className="text-center">
                <h1>Academic Grade Calculator</h1>
                <p>Created by Noam Zaks</p>
            </div>
            <Row>
                <div className="col-sm h-100">
                    <div className="overflow-auto px-3" style={{ height: "80vh" }}>
                        {state.semesters.map(semester => {
                            let pointSum = 0, gradeSum = 0, courseCount = 0

                            return (
                                <Card key={semester.name} className={"mb-2" + (semester.ignored ? " text-muted" : "")}>
                                    <Card.Header>
                                        <h3 className="text-center">{semester.name}</h3>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table striped hover>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Points</th>
                                                    <th>Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody className={semester.ignored ? " text-muted" : ""}>
                                                {semester.courses.map(course => {
                                                    if (!course.ignored) {
                                                        pointSum += course.points
                                                        gradeSum += course.grade * course.points
                                                        courseCount++
                                                    }

                                                    return (
                                                        <tr key={course.name} className={course.ignored ? " text-muted" : ""}>
                                                            <td><Button variant="secondary" className="btn-sm" onClick={() => ignoreCourse(course)}>{course.name}</Button></td>
                                                            <td>{course.points}</td>
                                                            <td>{course.grade}</td>
                                                        </tr>
                                                    )
                                                })}
                                                <tr>
                                                    <th>Total</th>
                                                    <th>{pointSum}</th>
                                                    <th>{(gradeSum / pointSum).toPrecision(4) || ""}</th>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                    <Card.Footer className="text-center">
                                        <Button variant="secondary" onClick={() => ignoreSemester(semester)}>Ignore</Button>
                                    </Card.Footer>
                                </Card>
                            )
                        })}
                    </div>
                </div>
                <div className="col-sm">
                    <h2 className="text-center">Additional Data</h2>
                    <Table striped hover>
                        <tbody>
                            <tr>
                                <th>Overall Average</th>
                                <td>{overallAverage || ""}</td>
                            </tr>
                            <tr>
                                <th>Overall Points</th>
                                <td>{overallPointSum}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <div className="w-100 d-flex">
                        <input type="file" className="d-none" ref={fileInput} onChange={open} />
                        <Button variant="success" className="mr-auto" onClick={() => fileInput.current.click()}>Open</Button>
                        <AddCourseModal callback={add} />
                        <a className="btn btn-success" download="grades.json" ref={saveButton}>Save</a>
                    </div>
                </div>
            </Row>
        </div>
    )
}

export default Home