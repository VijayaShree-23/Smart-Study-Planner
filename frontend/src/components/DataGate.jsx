import { useData } from '../data'
import { ErrorBox, PageLoader } from './ui'

/** Shows a loading or error state until the shared study data is available. */
export default function DataGate({ children }) {
  const { status, error, load } = useData()
  if (status === 'loading') return <PageLoader />
  if (status === 'error') return <ErrorBox message={`Unable to load your study data. ${error}`} onRetry={load} />
  return children
}
