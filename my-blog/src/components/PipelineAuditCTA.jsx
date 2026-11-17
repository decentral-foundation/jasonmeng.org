import { Link } from 'react-router-dom';
import lucia from '../lucia';
import { MIN_ETH } from '../../shared/payment.js';

// Small call to action for the Pipeline Audit PDF. Use it in JSX anywhere,
// or add `cta: 'pipeline-audit'` to a post in src/data/posts.js to show it
// under that post.
function PipelineAuditCTA() {
  return (
    <aside className="my-8 p-5 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="font-semibold text-gray-900">The 15-Minute Sales Pipeline Self-Audit</div>
        <p className="text-sm text-gray-600 mt-1">
          A 20-question scorecard, stage benchmarks, and fixes for the five most common pipeline leaks. $1 in USDC or {MIN_ETH} ETH.
        </p>
      </div>
      <Link
        to="/pipeline-audit"
        onClick={() => lucia.buttonClick('pipeline_audit_cta')}
        className="shrink-0 text-center px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 transition-colors"
      >
        Get the audit →
      </Link>
    </aside>
  );
}

export default PipelineAuditCTA;
