// Font Awesome sample (MIT)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartBar, faCalendar, faBell } from '@fortawesome/free-regular-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';

export const fontAwesomeIcons = [
  { icon: <FontAwesomeIcon icon={faUser} size="lg" />, label: 'User' },
  { icon: <FontAwesomeIcon icon={faChartBar} size="lg" />, label: 'Analytics' },
  { icon: <FontAwesomeIcon icon={faCalendar} size="lg" />, label: 'Calendar' },
  { icon: <FontAwesomeIcon icon={faCog} size="lg" />, label: 'Settings' },
  { icon: <FontAwesomeIcon icon={faBell} size="lg" />, label: 'Notifications' },
];
