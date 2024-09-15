import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/projects";
import { hasAutorization, taskBelongToProject, tasksExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

router.use(authenticate)

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La description del Proyecto es Obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:id',
    body('projectName')
        .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
    body('description')
        .notEmpty().withMessage('La description del Proyecto es Obligatoria'),
    handleInputErrors,
    ProjectController.updateProject
)

router.delete('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.deleteProject
)

/** Routes for tasks **/
router.param('projectId', projectExists)

router.post('/:projectId/tasks',
    hasAutorization,
    body('name')
        .notEmpty().withMessage('El Nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

router.param('taskId', tasksExists )
router.param('taskId', taskBelongToProject )


router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAutorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('name')
        .notEmpty().withMessage('El Nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La Descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAutorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('status')
        .notEmpty().withMessage('El estado de la tarea es obligatorio'),
    handleInputErrors,
    TaskController.updateStatusTask
)

/** Routes for teams */
router.post('/:projectId/team/find' , 
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team', 
    
    TeamMemberController.getProjectTeam
)

router.post('/:projectId/team' , 
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId', 
    param('userId')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

/** Routes for notas */
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota no puede estar vacío'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID No Válido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router