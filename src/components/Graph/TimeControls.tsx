import { ButtonGroupProps } from '@chakra-ui/button'
import { HistoryTimeframe } from '@shapeshiftoss/types'
import { Radio } from 'components/Radio/Radio'

type TimeControlsProps = {
  onChange: (arg: HistoryTimeframe) => void
  defaultTime: HistoryTimeframe
  buttonGroupProps?: ButtonGroupProps
}

export const TimeControls = ({ onChange, defaultTime, buttonGroupProps }: TimeControlsProps) => {
  const options = Object.freeze([
    { value: HistoryTimeframe.HOUR, label: 'modals.graph.timeControls.1H' },
    { value: HistoryTimeframe.DAY, label: 'modals.graph.timeControls.24H' },
    { value: HistoryTimeframe.WEEK, label: 'modals.graph.timeControls.1W' },
    { value: HistoryTimeframe.MONTH, label: 'modals.graph.timeControls.1M' },
    { value: HistoryTimeframe.YEAR, label: 'modals.graph.timeControls.1Y' },
    { value: HistoryTimeframe.ALL, label: 'modals.graph.timeControls.all' },
  ])
  return (
    <Radio
      options={options}
      defaultValue={defaultTime}
      onChange={onChange}
      buttonGroupProps={buttonGroupProps}
    />
  )
}
