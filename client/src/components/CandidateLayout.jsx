import { Outlet, useNavigate } from 'react-router-dom';
import { ASSESSMENT_TIME_MINUTES, PASSING_MARK, TOTAL_MARKS } from '../config/assessment';
import { APP_TAGLINE } from '../config/branding';
import { PortalFooter, PortalHeader } from './PortalShell';
import { switchPortal } from '../utils/portalStorage';
import { clearAdminSession } from '../utils/authStorage';

export default function CandidateLayout() {
  const navigate = useNavigate();

  const handleSwitchPortal = () => {
    clearAdminSession();
    switchPortal();
    navigate('/', { replace: true });
  };

  return (
    <div className="entegra-page-bg flex flex-col">
      <PortalHeader
        subtitle={`Candidate · ${APP_TAGLINE}`}
        homeTo="/candidate"
        onSwitchPortal={handleSwitchPortal}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <PortalFooter>
        {TOTAL_MARKS} Marks · Pass: {PASSING_MARK} · {ASSESSMENT_TIME_MINUTES} min · MCQ + Listening + Writing + Typing
      </PortalFooter>
    </div>
  );
}
