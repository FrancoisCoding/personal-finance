import { Composition } from 'remotion'
import { FinanceFlowMarketingVideo } from './src/FinanceFlowMarketingVideo'

export const RemotionRoot = () => {
  return (
    <Composition
      id="FinanceFlowMarketingTeaser"
      component={FinanceFlowMarketingVideo}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{}}
    />
  )
}
