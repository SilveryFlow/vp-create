export const VChartResolver = (componentName: string) => {
  if (componentName === 'VChart') {
    return {
      name: 'default',
      from: 'vue-echarts',
    }
  }
}
