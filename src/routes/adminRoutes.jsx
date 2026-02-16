import AdminPanelPage from '../pages/AdminPanelPage'
import AnnoucementsPage from '../pages/AnnoucementsPage'
import CityInfoPage from '../pages/CityInfoPage'
import EventsPage from '../pages/EventsPage'
import HomePage from '../pages/HomePage'
import NewsPage from '../pages/NewsPage'
import PollsPage from '../pages/PollsPage'
import RegistrationFormsPage from '../pages/RegistrationFormsPage'
import ReportsPage from '../pages/ReportsPage'
import UsersPage from '../pages/UsersPage'

const adminRoutes = [
  { id: 'home', path: 'home', element: <HomePage /> },
  { id: 'city-info', path: 'city-info', element: <CityInfoPage /> },
  { id: 'annoucements', path: 'annoucements', element: <AnnoucementsPage /> },
  { id: 'news', path: 'news', element: <NewsPage /> },
  { id: 'events', path: 'events', element: <EventsPage /> },
  { id: 'polls', path: 'polls', element: <PollsPage /> },
  { id: 'registration', path: 'registration-forms', element: <RegistrationFormsPage /> },
  { id: 'reports', path: 'reports', element: <ReportsPage /> },
  { id: 'users', path: 'users', element: <UsersPage /> },
  { id: 'admin-panel', path: 'panel', element: <AdminPanelPage /> }
]

export default adminRoutes
