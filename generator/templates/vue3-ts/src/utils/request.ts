import axios from 'axios'
import { ElNotification, ElMessage, ElLoading } from 'element-plus'
import { saveAs } from 'file-saver'

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_BASE_API || '/api',
  // 超时
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const msg = res.data.msg || '系统异常'

    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }

    if (code === 401) {
      ElMessage.error('登录状态已过期')

      return Promise.reject('无效的会话，或者会话已过期')
    } else if (code === 500) {
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({
        title: msg,
      })
      return Promise.reject('error')
    } else {
      return res.data
    }
  },
  error => {
    console.log('err' + error)
    let { message } = error

    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }

    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000,
    })

    return Promise.reject(error)
  },
)

// 通用下载方法
export async function download(
  url: string,
  params: Record<string, unknown> | FormData,
  filename: string,
) {
  const downloadLoadingInstance = ElLoading.service({
    text: '正在下载数据，请稍候',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const { data } = await service.post<Blob>(url, params, {
      responseType: 'blob',
    })
    const blob = data instanceof Blob ? data : new Blob([data])
    saveAs(blob, filename)
    downloadLoadingInstance.close()
  } catch (r) {
    console.error(r)
    ElMessage.error('下载文件出现错误，请联系管理员！')
    downloadLoadingInstance.close()
  }
}

export default service
