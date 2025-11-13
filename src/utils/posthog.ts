/**
 * PostHog utilities for event tracking
 * 
 * Use the usePostHog hook in React components to track events:
 * 
 * @example
 * ```tsx
 * import { usePostHog } from 'posthog-js/react'
 * 
 * function MyComponent() {
 *   const posthog = usePostHog()
 *   
 *   const handleClick = () => {
 *     posthog?.capture('button_clicked', { button_name: 'submit' })
 *   }
 *   
 *   return <button onClick={handleClick}>Click me</button>
 * }
 * ```
 */
export { usePostHog } from 'posthog-js/react'

