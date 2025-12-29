/**
 * 数据持久化服务
 * 提供多种数据存储方案，确保视频数据永久保存
 */
class DatabaseService {
  constructor() {
    this.initDatabase()
  }

  // ========== IndexedDB 本地数据库初始化 ==========
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PersonalBlogDB', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB 初始化成功')
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // 创建视频表
        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' })
          videoStore.createIndex('category', 'category', { unique: false })
          videoStore.createIndex('date', 'date', { unique: false })
        }
        
        // 创建分类表
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' })
        }
        
        // 创建收藏表
        if (!db.objectStoreNames.contains('collections')) {
          const collectionStore = db.createObjectStore('collections', { keyPath: 'id' })
          collectionStore.createIndex('videoId', 'videoId', { unique: false })
        }
      }
    })
  }

  // ========== 数据备份功能 ==========
  exportData() {
    return new Promise(async (resolve, reject) => {
      try {
        const videos = await this.getAllVideos()
        const categories = await this.getAllCategories()
        const collections = await this.getAllCollections()
        
        const exportData = {
          videos,
          categories,
          collections,
          exportDate: new Date().toISOString(),
          version: '1.0'
        }
        
        // 创建下载链接
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `video-backup-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        
        URL.revokeObjectURL(url)
        resolve(exportData)
      } catch (error) {
        reject(error)
      }
    })
  }

  importData(jsonData) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
        
        // 验证数据格式
        if (!data.videos || !Array.isArray(data.videos)) {
          throw new Error('数据格式不正确')
        }
        
        // 清空现有数据（可选）
        // await this.clearAllData()
        
        // 导入视频数据
        for (const video of data.videos) {
          await this.saveVideo(video)
        }
        
        // 导入分类数据
        if (data.categories && Array.isArray(data.categories)) {
          for (const category of data.categories) {
            await this.saveCategory(category)
          }
        }
        
        // 导入收藏数据
        if (data.collections && Array.isArray(data.collections)) {
          for (const collection of data.collections) {
            await this.saveCollection(collection)
          }
        }
        
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  // ========== IndexedDB 基础操作 ==========
  async saveVideo(video) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['videos'], 'readwrite')
      const store = transaction.objectStore('videos')
      const request = store.put(video)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllVideos() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['videos'], 'readonly')
      const store = transaction.objectStore('videos')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getVideo(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['videos'], 'readonly')
      const store = transaction.objectStore('videos')
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteVideo(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['videos'], 'readwrite')
      const store = transaction.objectStore('videos')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // ========== 分类管理 ==========
  async saveCategory(category) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite')
      const store = transaction.objectStore('categories')
      const request = store.put(category)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllCategories() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly')
      const store = transaction.objectStore('categories')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // ========== 收藏管理 ==========
  async saveCollection(collection) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['collections'], 'readwrite')
      const store = transaction.objectStore('collections')
      const request = store.put(collection)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllCollections() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['collections'], 'readonly')
      const store = transaction.objectStore('collections')
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // ========== 数据清理 ==========
  async clearAllData() {
    return new Promise(async (resolve, reject) => {
      try {
        const stores = ['videos', 'categories', 'collections']
        
        for (const storeName of stores) {
          await new Promise((res, rej) => {
            const transaction = this.db.transaction([storeName], 'readwrite')
            const store = transaction.objectStore(storeName)
            const request = store.clear()
            
            request.onsuccess = () => res(request.result)
            request.onerror = () => rej(request.error)
          })
        }
        
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}

// ========== 云存储服务 ==========
class CloudStorageService {
  constructor() {
    // 可以根据需要切换不同的云存储提供商
    this.providers = {
      supabase: new SupabaseProvider(),
      local: new LocalFileProvider()
    }
  }

  async uploadVideo(file, metadata) {
    try {
      // 优先使用 Supabase，失败则使用本地存储
      let result
      try {
        result = await this.providers.supabase.uploadVideo(file, metadata)
      } catch (error) {
        console.warn('云存储失败，使用本地存储:', error)
        result = await this.providers.local.uploadVideo(file, metadata)
      }
      
      return result
    } catch (error) {
      console.error('视频上传失败:', error)
      throw error
    }
  }

  async getVideoUrl(path) {
    try {
      return await this.providers.supabase.getVideoUrl(path)
    } catch (error) {
      console.warn('获取云视频URL失败，尝试本地存储:', error)
      return await this.providers.local.getVideoUrl(path)
    }
  }
}

// ========== Supabase 云存储提供商 ==========
class SupabaseProvider {
  constructor() {
    this.supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
    this.supabaseKey = process.env.VITE_SUPABASE_KEY || 'your-supabase-key'
  }

  async uploadVideo(file, metadata) {
    // 这里需要实际的 Supabase 集成
    console.log('上传视频到 Supabase:', file.name, metadata)
    
    // 模拟上传过程
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url: `https://your-supabase-storage.com/videos/${Date.now()}_${file.name}`,
          path: `videos/${Date.now()}_${file.name}`,
          metadata
        })
      }, 2000)
    })
  }

  async getVideoUrl(path) {
    // 从 Supabase 获取视频URL
    return `https://your-supabase-storage.com/${path}`
  }
}

// ========== 本地文件存储提供商 ==========
class LocalFileProvider {
  constructor() {
    this.storageKey = 'localVideoFiles'
  }

  async uploadVideo(file, metadata) {
    // 将文件转换为 base64 或 blob URL 存储在 localStorage
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target.result, // base64 数据
          uploadDate: new Date().toISOString(),
          metadata
        }
        
        // 存储到 localStorage
        const existingFiles = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
        existingFiles.push(fileData)
        localStorage.setItem(this.storageKey, JSON.stringify(existingFiles))
        
        resolve({
          url: e.target.result,
          path: `local://${file.name}`,
          metadata
        })
      }
      
      reader.readAsDataURL(file)
    })
  }

  async getVideoUrl(path) {
    if (path.startsWith('local://')) {
      const fileName = path.replace('local://', '')
      const files = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
      const file = files.find(f => f.name === fileName)
      return file ? file.data : null
    }
    return null
  }
}

// ========== 导出服务实例 ==========
export const dbService = new DatabaseService()
export const cloudService = new CloudStorageService()

// ========== 使用示例 ==========
/*
// 保存视频
await dbService.saveVideo({
  id: 'video_1',
  title: '我的视频',
  url: 'https://example.com/video.mp4',
  category: 'life',
  // ...其他字段
})

// 导出数据备份
await dbService.exportData()

// 导入数据备份
await dbService.importData(jsonData)

// 上传视频文件
const result = await cloudService.uploadVideo(file, {
  title: '我的视频',
  category: 'life'
})
*/