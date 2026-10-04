import './style.css';
import type { OCRRegion } from '../../lib/types';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <p>Test</p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);
