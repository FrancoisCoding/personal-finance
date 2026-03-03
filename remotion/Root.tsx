import { Composition } from 'remotion'
import { FinanceFlowMarketingVideo } from './src/FinanceFlowMarketingVideo'

export const RemotionRoot = () => {
  return (
    <Composition
      id="FinanceFlowMarketingTeaser"
      component={FinanceFlowMarketingVideo}
      durationInFrames={1476}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{}}
    />
  )
}
