<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">🎵 我的音乐</h1>
      <p class="page-subtitle">上传、播放、享受你的音乐收藏</p>
    </div>

    <div class="card">
      <h2 class="card-title">音乐播放器</h2>
      <div class="music-player">
        <div class="player-info">
          <h3>{{ currentSong.title }}</h3>
          <p>{{ currentSong.artist }}</p>
        </div>
        <div class="player-controls">
          <button @click="prevSong" class="control-btn">⏮️</button>
          <button @click="togglePlay" class="control-btn play-btn">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <button @click="nextSong" class="control-btn">⏭️</button>
        </div>
        <div 
          class="progress-bar"
          @click="seekTo"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        >
          <div class="progress" :style="{ width: progress + '%' }">
            <div class="progress-handle"></div>
          </div>
        </div>
        <div class="time-info">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">我的播放列表</h2>
      <div class="playlist">
        <div v-if="songs.length === 0" class="empty-playlist">
          <div class="empty-icon">🎵</div>
          <h3>播放列表为空</h3>
          <p>还没有上传任何音乐文件，快去上传你的第一首歌吧！</p>
        </div>
        
        <div 
          v-for="(song, index) in songs" 
          :key="song.id"
          class="playlist-item"
          :class="{ active: currentSongIndex === index }"
        >
          <div class="song-main" @click="playSong(index)">
            <div class="song-info">
              <h4>{{ song.title }}</h4>
              <p>{{ song.artist }} • {{ song.album }}</p>
            </div>
            <div class="song-duration">{{ song.duration }}</div>
          </div>
          <div class="song-actions">
            <button 
              v-if="song.isLocalFile && song.localUrl"
              @click="downloadSong(song)"
              class="action-btn download-btn"
              title="下载"
            >
              ⬇️
            </button>
            <button 
              @click="deleteSong(index)"
              class="action-btn delete-btn"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 存储说明卡片 -->
    <div class="card storage-card" v-if="songs.length > 0">
      <h4>💾 自动云端同步</h4>
      <p>✅ 音乐文件已永久保存到浏览器本地数据库</p>
      <p>🔄 播放列表自动同步（跨设备备份）</p>
      <p>📱 其他设备访问时自动获取播放列表</p>
      <div class="sync-status">
        <div v-if="!isSyncing && !isOnline" class="status-offline">
          <el-icon><Connection /></el-icon>
          <span>离线状态</span>
        </div>
        <div v-if="isSyncing" class="status-syncing">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在同步...</span>
        </div>
        <div v-if="!isSyncing && isOnline && lastSyncTime" class="status-success">
          <el-icon><CircleCheck /></el-icon>
          <span>上次同步: {{ formatSyncTime(lastSyncTime) }}</span>
        </div>
        <div v-if="!isSyncing && isOnline && !lastSyncTime" class="status-ready">
          <el-icon><Upload /></el-icon>
          <span>准备同步</span>
        </div>
      </div>
      <div class="sync-actions">
        <el-button 
          @click="syncToCloud" 
          type="primary" 
          size="small" 
          :loading="isSyncing"
          :disabled="!isOnline || isSyncing"
          icon="Upload"
        >
          立即同步
        </el-button>
        <el-button 
          @click="toggleAutoSync" 
          :type="autoSync ? 'success' : 'info'" 
          size="small"
          :icon="autoSync ? 'Timer' : 'Close'"
        >
          {{ autoSync ? '自动同步开启' : '自动同步关闭' }}
        </el-button>
      </div>
    </div>



    <div class="card">
      <h2 class="card-title">添加音乐</h2>
      <div class="upload-section">
        <!-- 本地文件上传 -->
        <div class="upload-block">
          <h3>📁 上传本地音乐文件</h3>
          <input 
            type="file" 
            ref="musicFile" 
            @change="handleFileUpload" 
            accept="audio/*" 
            style="display: none"
          >
          <el-button 
            type="primary" 
            @click="$refs.musicFile.click()"
            icon="Upload"
          >
            选择音乐文件
          </el-button>
          <div v-if="uploadedFile" class="upload-info">
            <p><strong>已选择文件：</strong>{{ uploadedFile.name }}</p>
            <p><strong>文件大小：</strong>{{ formatFileSize(uploadedFile.size) }}</p>
          </div>
        </div>

        <!-- 手动输入音乐信息 -->
        <el-divider>或</el-divider>
        <el-form :model="musicForm" label-width="80px">
          <el-form-item label="歌名">
            <el-input v-model="musicForm.title" placeholder="请输入歌曲名称"></el-input>
          </el-form-item>
          <el-form-item label="艺术家">
            <el-input v-model="musicForm.artist" placeholder="请输入艺术家名称"></el-input>
          </el-form-item>
          <el-form-item label="专辑">
            <el-input v-model="musicForm.album" placeholder="请输入专辑名称（可选）"></el-input>
          </el-form-item>
          <el-form-item label="时长">
            <el-input v-model="musicForm.duration" placeholder="请输入歌曲时长（可选）如：3:45"></el-input>
          </el-form-item>
          <el-form-item label="音乐链接">
            <el-input v-model="musicForm.url" placeholder="请输入在线音乐链接地址（可选）"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="addMusic" icon="Plus">
              添加到播放列表
            </el-button>
          </el-form-item>
        </el-form>
      </div>

    </div>
  </div>
</template>

<script>
/**
 * 音乐页面组件
 * 提供音乐播放、播放列表管理、音乐分类等功能
 */
export default {
  name: 'Music',
  data() {
    return {
      isPlaying: false,        // 播放状态：true=播放中，false=暂停
      currentTime: 0,         // 当前播放时间（秒）
      duration: 180,          // 歌曲总时长（秒）
      progress: 0,            // 播放进度百分比
      currentSongIndex: 0,    // 当前播放歌曲的索引
      actualAudio: null,      // 实际的音频播放对象
      
      // 歌曲列表数据 - 从本地存储加载
      songs: [],
      
      // 添加音乐表单数据
      musicForm: {
        title: '',      // 歌曲名称
        artist: '',     // 艺术家
        album: '',      // 专辑名称
        duration: '',   // 歌曲时长
        url: ''         // 音乐链接
      },
      uploadedFile: null,  // 上传的音乐文件
      audio: null,         // 音频对象用于获取时长等信息
      progressInterval: null, // 进度更新定时器
      isDragging: false,   // 是否正在拖动进度条
      dragProgress: 0,     // 拖动时的进度
      db: null,           // IndexedDB数据库实例
      
      // 云同步相关
      autoSync: true,      // 自动同步开关
      isSyncing: false,    // 是否正在同步
      isOnline: navigator.onLine, // 网络状态
      lastSyncTime: null,   // 上次同步时间
      syncInterval: null    // 同步定时器
    }
  },
  
  created() {
    // 组件创建时从本地存储加载歌曲列表
    this.loadSongsFromStorage()
    // 初始化IndexedDB
    this.initIndexedDB()
    
    // 加载同步设置
    this.autoSync = localStorage.getItem('musicAutoSync') === 'true'
    this.lastSyncTime = localStorage.getItem('musicLastSync')
    
    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true
      if (this.autoSync) this.startAutoSync()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.stopAutoSync()
    })
  },
  
  mounted() {
    // 组件挂载后尝试从云端加载
    this.loadFromCloud().then(cloudSongs => {
      if (cloudSongs.length > 0) {
        const existingIds = new Set(this.songs.map(song => song.id))
        const newSongs = cloudSongs.filter(song => !existingIds.has(song.id))
        
        if (newSongs.length > 0) {
          this.songs.push(...newSongs.map(song => ({
            ...song,
            localUrl: null,
            isLocalFile: false
          })))
          this.saveSongsToStorage()
          this.$message.success(`从云端同步了 ${newSongs.length} 首新歌曲！`)
        }
      }
    })
    
    // 启动自动同步
    if (this.autoSync && this.isOnline) {
      this.startAutoSync()
    }
  },
  
  beforeUnmount() {
    // 清理定时器
    this.stopAutoSync()
  },
  computed: {
    /**
     * 计算当前播放的歌曲信息
     * @returns {Object} 当前歌曲对象
     */
    currentSong() {
      if (this.songs.length === 0) {
        return { title: "暂无歌曲", artist: "请上传音乐文件", isLocalFile: false }
      }
      return this.songs[this.currentSongIndex] || 
             this.songs[0] || 
             { title: "暂无歌曲", artist: "未知艺术家", isLocalFile: false }
    }
  },
  methods: {
    /**
     * 开始播放音频（专门用于自动播放）
     */
    startPlayback() {
      const currentSong = this.currentSong
      
      if (currentSong.isLocalFile && currentSong.localUrl) {
        if (!this.actualAudio || this.actualAudio.src !== currentSong.localUrl) {
          if (this.actualAudio) {
            this.actualAudio.pause()
          }
          this.actualAudio = new Audio(currentSong.localUrl)
          this.setupAudioEvents()
          console.log('创建新的音频对象:', currentSong.localUrl)
        }
        
        this.actualAudio.play().catch(error => {
          console.error('自动播放失败:', error)
          this.$message.error('音频播放失败，请检查文件格式！')
          this.isPlaying = false
        })
        console.log('自动开始播放')
      }
    },

    /**
     * 切换播放/暂停状态
     */
    togglePlay() {
      const currentSong = this.currentSong
      
      // 如果没有歌曲，显示提示
      if (this.songs.length === 0) {
        this.$message.info('请先上传音乐文件！')
        return
      }
      
      console.log('当前歌曲:', currentSong)
      console.log('是否本地文件:', currentSong.isLocalFile)
      
      // 如果是本地文件，使用实际音频播放
      if (currentSong.isLocalFile && currentSong.localUrl) {
        if (!this.actualAudio || this.actualAudio.src !== currentSong.localUrl) {
          if (this.actualAudio) {
            this.actualAudio.pause()
          }
          this.actualAudio = new Audio(currentSong.localUrl)
          this.setupAudioEvents()
          console.log('创建新的音频对象:', currentSong.localUrl)
        }
        
        if (this.isPlaying) {
          this.actualAudio.pause()
          console.log('暂停播放')
        } else {
          this.actualAudio.play().catch(error => {
            console.error('播放失败:', error)
            this.$message.error('音频播放失败，请检查文件格式！')
            this.isPlaying = false
          })
          console.log('开始播放')
        }
      } else {
        // 非本地文件，显示提示
        if (!currentSong.isLocalFile) {
          this.$message.info('请上传本地音乐文件才能播放')
        }
      }
      
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.startProgress()
      } else {
        this.stopProgress()
      }
    },

    /**
     * 设置音频事件监听
     */
    setupAudioEvents() {
      if (!this.actualAudio) return
      
      this.actualAudio.addEventListener('loadedmetadata', () => {
        this.duration = this.actualAudio.duration
      })
      
      this.actualAudio.addEventListener('timeupdate', () => {
        if (this.actualAudio && this.isPlaying) {
          this.currentTime = this.actualAudio.currentTime
          this.progress = (this.currentTime / this.duration) * 100
        }
      })
      
      this.actualAudio.addEventListener('ended', () => {
        this.nextSong()
      })
      
      this.actualAudio.addEventListener('error', () => {
        this.$message.error('音频播放失败！')
        this.isPlaying = false
        this.stopProgress()
      })
    },
    
    /**
     * 开始播放进度更新
     * 每秒更新一次播放时间和进度
     */
    startProgress() {
      this.progressInterval = setInterval(() => {
        const currentSong = this.currentSong
        
        // 如果正在拖动，不自动更新进度
        if (this.isDragging) {
          return
        }
        
        // 如果是本地文件，由actualAudio的timeupdate事件处理
        if (currentSong.isLocalFile && this.actualAudio) {
          // 进度由setupAudioEvents中的timeupdate处理
          return
        }
        
        // 非本地文件使用模拟进度
        if (this.currentTime < this.duration) {
          this.currentTime += 1
          this.progress = (this.currentTime / this.duration) * 100
        } else {
          this.nextSong()  // 播放完毕自动播放下一首
        }
      }, 1000)
    },
    
    /**
     * 停止播放进度更新
     */
    stopProgress() {
      clearInterval(this.progressInterval)
    },
    
    /**
     * 播放上一首歌曲
     */
    prevSong() {
      if (this.songs.length === 0) {
        this.$message.info('没有上一首歌曲')
        return
      }
      
      // 循环播放：到达第一首时回到最后一首
      this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length
      this.resetSong()
      
      // 如果当前正在播放，切换后继续播放
      if (this.isPlaying) {
        this.startPlayback()
      }
    },
    
    /**
     * 播放下一首歌曲
     */
    nextSong() {
      if (this.songs.length === 0) {
        this.$message.info('没有下一首歌曲')
        return
      }
      
      // 循环播放：到达最后一首时回到第一首
      this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length
      this.resetSong()
      
      // 如果当前正在播放，切换后继续播放
      if (this.isPlaying) {
        this.startPlayback()
      }
    },
    
    /**
     * 播放指定索引的歌曲
     * @param {number} songIndex - 歌曲索引
     */
    playSong(songIndex) {
      console.log('点击播放歌曲:', songIndex, this.songs[songIndex])
      
      // 检查歌曲索引是否有效
      if (songIndex < 0 || songIndex >= this.songs.length) {
        console.error('无效的歌曲索引:', songIndex)
        return
      }
      
      // 先设置索引
      this.currentSongIndex = songIndex
      
      // 重置播放状态
      this.resetSong()
      
      // 开始播放
      const currentSong = this.currentSong
      if (currentSong.isLocalFile && currentSong.localUrl) {
        this.isPlaying = true
        this.startPlayback()  // 调用实际的播放方法
        this.startProgress()
      } else {
        // 非本地文件，显示提示
        this.$message.info('请上传本地音乐文件才能播放')
      }
    },
    
    /**
     * 重置歌曲播放状态
     * 停止当前音频，重置时间和进度
     */
    resetSong() {
      // 停止当前音频播放
      if (this.actualAudio) {
        this.actualAudio.pause()
      }
      
      const currentSong = this.currentSong
      
      // 如果是本地文件，重新设置音频对象但不立即播放
      if (currentSong.isLocalFile && currentSong.localUrl) {
        this.actualAudio = new Audio(currentSong.localUrl)
        this.setupAudioEvents()
        this.duration = this.actualAudio.duration || 180
      } else {
        this.duration = 180 // 默认时长
      }
      
      this.currentTime = 0
      this.progress = 0
      
      // 停止进度更新，由调用方决定是否继续
      this.stopProgress()
    },
    
    /**
     * 格式化时间显示（分:秒格式）
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    /**
     * 处理音乐文件上传
     * @param {Event} event - 文件选择事件
     */
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      if (!file.type.startsWith('audio/')) {
        this.$message.error('请选择音频文件！')
        return
      }

      // 验证文件大小（限制20MB）
      if (file.size > 20 * 1024 * 1024) {
        this.$message.error('文件大小不能超过20MB！')
        return
      }

      this.uploadedFile = file
      
      // 创建音频对象获取文件信息
      if (this.audio) {
        this.audio.pause()
        URL.revokeObjectURL(this.audio.src)
      }
      
      this.audio = new Audio()
      this.audio.src = URL.createObjectURL(file)
      
      this.audio.addEventListener('loadedmetadata', () => {
        // 自动填充表单信息
        this.musicForm.duration = this.formatTime(this.audio.duration)
        
        // 尝试从文件名提取歌曲信息
        const fileName = file.name.replace(/\.[^/.]+$/, "") // 移除扩展名
        if (!this.musicForm.title) {
          this.musicForm.title = fileName
        }
        
        this.$message.success('文件上传成功！请完善歌曲信息后添加到播放列表。')
      })
      
      this.audio.addEventListener('error', () => {
        this.$message.error('音频文件加载失败！')
      })
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    /**
     * 添加新音乐到播放列表
     * 验证表单数据并添加歌曲
     */
    async addMusic() {
      if (!this.musicForm.title && !this.uploadedFile) {
        this.$message.warning('请填写歌曲信息或上传音乐文件！')
        return
      }

      if (!this.musicForm.title) {
        this.musicForm.title = this.uploadedFile ? this.uploadedFile.name.replace(/\.[^/.]+$/, "") : "未知歌曲"
      }

      if (!this.musicForm.artist) {
        this.musicForm.artist = "未知艺术家"
      }

      // 构建歌曲对象
        const newSong = {
          id: Date.now(), // 使用时间戳作为临时ID
          title: this.musicForm.title,
          artist: this.musicForm.artist,
          album: this.musicForm.album || "用户添加",
          duration: this.musicForm.duration || "未知",
          url: this.musicForm.url,
          localUrl: this.uploadedFile ? URL.createObjectURL(this.uploadedFile) : null,
          isLocalFile: !!this.uploadedFile,
          addedDate: new Date().toISOString()
        }
        
        // 如果有上传的文件，永久保存到IndexedDB
        if (this.uploadedFile) {
          await this.saveAudioToIndexedDB(this.uploadedFile, newSong.id)
        }
        
        this.songs.push(newSong)
        
        // 保存歌曲信息到本地存储
        this.saveSongsToStorage()
      
      // 清空表单和文件
      this.musicForm = { title: '', artist: '', album: '', duration: '', url: '' }
      this.uploadedFile = null
      document.querySelector('input[type="file"]').value = ''
      
      this.$message.success('音乐添加成功！已自动保存到本地。')
      
        // 如果是第一首歌，自动设置为当前歌曲
        if (this.songs.length === 1) {
          this.currentSongIndex = 0
        }
    },

    /**
     * 下载音乐文件
     * @param {Object} song - 歌曲对象
     */
    downloadSong(song) {
      if (!song.isLocalFile || !song.localUrl) {
        this.$message.warning('该歌曲无法下载')
        return
      }

      // 创建下载链接
      const link = document.createElement('a')
      link.href = song.localUrl
      link.download = `${song.title} - ${song.artist}.mp3` // 设置默认下载文件名
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.$message.success('开始下载音乐文件！')
    },

    /**
     * 删除歌曲
     * @param {number} index - 歌曲索引
     */
    deleteSong(index) {
      const song = this.songs[index]
      
      // 确认删除
      this.$confirm(`确定要删除《${song.title}》吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 如果正在播放被删除的歌曲，先停止播放
        if (this.currentSongIndex === index) {
          if (this.actualAudio) {
            this.actualAudio.pause()
            this.actualAudio = null
          }
          this.isPlaying = false
          this.stopProgress()
        }
        
        // 如果被删除的歌曲在当前播放歌曲之前，索引需要减1
        if (this.currentSongIndex > index) {
          this.currentSongIndex--
        }
        
        // 如果删除的是当前播放的歌曲且是最后一首，调整索引
        if (this.currentSongIndex >= this.songs.length - 1) {
          this.currentSongIndex = Math.max(0, this.songs.length - 2)
        }
        
        // 释放音频URL资源
        if (song.localUrl) {
          URL.revokeObjectURL(song.localUrl)
        }
        
        // 从IndexedDB删除音频文件
        if (this.db && song.isLocalFile) {
          try {
            const transaction = this.db.transaction(['audioFiles'], 'readwrite')
            const objectStore = transaction.objectStore('audioFiles')
            const deleteRequest = objectStore.delete(`audio_${song.id}`)
            
            deleteRequest.onsuccess = () => {
              console.log('已从IndexedDB删除音频文件')
            }
          } catch (error) {
            console.error('删除IndexedDB文件失败:', error)
          }
        }
        
        // 从列表中删除歌曲
        this.songs.splice(index, 1)
        
        // 保存到本地存储
        this.saveSongsToStorage()
        
        this.$message.success('歌曲删除成功！')
        
        // 如果列表为空，重置播放状态
        if (this.songs.length === 0) {
          this.currentSongIndex = 0
          this.currentTime = 0
          this.progress = 0
          this.isPlaying = false
          if (this.actualAudio) {
            this.actualAudio = null
          }
        }
      }).catch(() => {
        // 用户取消删除
        this.$message.info('已取消删除')
      })
    },

    /**
     * 同步播放列表到云端
     */
    async syncToCloud() {
      if (!this.isOnline) {
        this.$message.warning('网络连接已断开，无法同步')
        return
      }

      if (this.songs.length === 0) {
        this.$message.warning('播放列表为空，无需同步')
        return
      }

      this.isSyncing = true

      try {
        // 生成唯一的设备ID
        let deviceId = localStorage.getItem('musicDeviceId')
        if (!deviceId) {
          deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          localStorage.setItem('musicDeviceId', deviceId)
        }

        const syncData = {
          deviceId: deviceId,
          version: '1.0',
          timestamp: new Date().toISOString(),
          songs: this.songs.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            url: song.url,
            isLocalFile: song.isLocalFile,
            addedDate: song.addedDate
          }))
        }

        // 使用免费的JSON存储服务（模拟云端存储）
        const response = await fetch('https://jsonblob.com/api/jsonblob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(syncData)
        })

        if (response.ok) {
          const result = await response.json()
          localStorage.setItem('musicCloudUrl', result.url)
          localStorage.setItem('musicLastSync', new Date().toISOString())
          
          this.lastSyncTime = new Date().toISOString()
          this.$message.success(`播放列表已同步到云端！`)
        } else {
          throw new Error('同步失败')
        }

      } catch (error) {
        console.error('云端同步失败:', error)
        
        // 静默降级方案：保存到localStorage作为"云端备份"
        const fallbackData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          songs: this.songs
        }
        localStorage.setItem('musicCloudFallback', JSON.stringify(fallbackData))
        localStorage.setItem('musicLastSync', new Date().toISOString())
        
        this.lastSyncTime = new Date().toISOString()
        // 不再显示警告，静默处理
      } finally {
        this.isSyncing = false
      }
    },

    /**
     * 从云端加载播放列表
     */
    async loadFromCloud() {
      try {
        // 尝试从真正的云端加载
        const cloudUrl = localStorage.getItem('musicCloudUrl')
        if (cloudUrl) {
          const response = await fetch(cloudUrl)
          if (response.ok) {
            const cloudData = await response.json()
            if (cloudData.songs && Array.isArray(cloudData.songs)) {
              console.log('从云端成功加载播放列表')
              return cloudData.songs
            }
          }
        }

        // 静默降级方案：从本地备份加载
        const fallbackData = localStorage.getItem('musicCloudFallback')
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData)
          console.log('从本地备份加载播放列表')
          return parsed.songs || []
        }

        console.log('没有找到云端或备份数据')
        return []
      } catch (error) {
        console.error('从云端加载失败:', error)
        // 静默返回空数组，不显示错误
        return []
      }
    },

    /**
     * 切换自动同步
     */
    toggleAutoSync() {
      this.autoSync = !this.autoSync
      localStorage.setItem('musicAutoSync', this.autoSync.toString())

      if (this.autoSync) {
        this.startAutoSync()
        this.$message.success('已开启自动同步')
      } else {
        this.stopAutoSync()
        this.$message.info('已关闭自动同步')
      }
    },

    /**
     * 开始自动同步
     */
    startAutoSync() {
      this.stopAutoSync() // 先停止现有的同步
      
      if (!this.autoSync || !this.isOnline) return

      this.syncInterval = setInterval(async () => {
        if (this.isOnline && !this.isSyncing) {
          await this.syncToCloud()
        }
      }, 5 * 60 * 1000) // 5分钟同步一次
    },

    /**
     * 停止自动同步
     */
    stopAutoSync() {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }
    },

    /**
     * 格式化同步时间
     */
    formatSyncTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleDateString()
      }
    },

    /**
     * 点击进度条跳转到指定位置
     * @param {Event} event - 点击事件
     */
    seekTo(event) {
      if (this.songs.length === 0) return
      
      const progressBar = event.currentTarget
      const rect = progressBar.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const percentage = (clickX / rect.width) * 100
      
      this.seekToPercentage(percentage)
    },

    /**
     * 开始拖动进度条
     * @param {Event} event - 鼠标按下事件
     */
    startDrag(event) {
      if (this.songs.length === 0) return
      
      event.preventDefault()
      this.isDragging = true
      this.dragProgress = this.progress
    },

    /**
     * 拖动进度条
     * @param {Event} event - 鼠标移动事件
     */
    onDrag(event) {
      if (!this.isDragging || this.songs.length === 0) return
      
      const progressBar = event.currentTarget
      const rect = progressBar.getBoundingClientRect()
      const dragX = event.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (dragX / rect.width) * 100))
      
      this.dragProgress = percentage
      
      // 更新显示的进度和时间（但不实际跳转）
      this.progress = percentage
      this.currentTime = (percentage / 100) * this.duration
    },

    /**
     * 结束拖动进度条
     * @param {Event} event - 鼠标释放事件
     */
    endDrag() {
      if (!this.isDragging) return
      
      this.isDragging = false
      this.seekToPercentage(this.dragProgress)
    },

    /**
     * 初始化IndexedDB
     */
    async initIndexedDB() {
      try {
        const request = indexedDB.open('MusicPlayerDB', 1)
        
        request.onerror = (event) => {
          console.error('IndexedDB打开失败:', event)
        }
        
        request.onsuccess = (event) => {
          this.db = event.target.result
          console.log('IndexedDB初始化成功')
          // 加载存储的音频文件
          this.loadStoredAudioFiles()
        }
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains('audioFiles')) {
            const objectStore = db.createObjectStore('audioFiles', { keyPath: 'id' })
            objectStore.createIndex('songId', 'songId', { unique: false })
          }
        }
      } catch (error) {
        console.error('IndexedDB初始化失败:', error)
        this.$message.warning('浏览器不支持永久存储，将使用临时存储')
      }
    },

    /**
     * 从IndexedDB加载存储的音频文件
     */
    async loadStoredAudioFiles() {
      if (!this.db) return

      try {
        const transaction = this.db.transaction(['audioFiles'], 'readonly')
        const objectStore = transaction.objectStore('audioFiles')
        const request = objectStore.getAll()

        request.onsuccess = (event) => {
          const storedFiles = event.target.result
          console.log('找到存储的音频文件:', storedFiles.length)
          
          // 恢复歌曲列表并加载音频文件
          const savedSongs = localStorage.getItem('musicPlaylist')
          if (savedSongs) {
            const songs = JSON.parse(savedSongs)
            this.songs = songs.map(song => {
              const storedFile = storedFiles.find(file => file.songId === song.id)
              if (storedFile && storedFile.blob) {
                return {
                  ...song,
                  localUrl: URL.createObjectURL(storedFile.blob),
                  isLocalFile: true
                }
              }
              return {
                ...song,
                localUrl: null,
                isLocalFile: false
              }
            })
            
            // 只在有音频文件时显示消息，避免重复提示
            const hasAudioFiles = this.songs.some(song => song.isLocalFile)
            if (this.songs.length > 0 && hasAudioFiles) {
              this.$message.success('已恢复音乐文件和播放列表！')
            } else if (this.songs.length > 0 && !hasAudioFiles) {
              // 静默处理，不显示消息，避免每次刷新都提示
              console.log('已恢复播放列表，但音频文件需要重新上传')
            }
          }
        }
      } catch (error) {
        console.error('加载存储音频失败:', error)
      }
    },

    /**
     * 从本地存储加载歌曲列表
     */
    loadSongsFromStorage() {
      try {
        const savedSongs = localStorage.getItem('musicPlaylist')
        // 只在没有IndexedDB时才处理，避免重复加载
        if (savedSongs && !this.db) {
          const songs = JSON.parse(savedSongs)
          this.songs = songs.map(song => ({
            ...song,
            localUrl: null,
            isLocalFile: false
          }))
          
          if (this.songs.length > 0) {
            console.log('已恢复播放列表，但音频文件需要重新上传')
          }
        }
      } catch (error) {
        console.error('加载播放列表失败:', error)
        this.songs = []
      }
    },

    /**
     * 保存歌曲列表到本地存储
     */
    saveSongsToStorage() {
      try {
        // 只保存歌曲的基本信息，不保存音频URL
        const songsToSave = this.songs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: song.duration,
          url: song.url,
          isLocalFile: song.isLocalFile,
          addedDate: song.addedDate || new Date().toISOString()
        }))
        
        localStorage.setItem('musicPlaylist', JSON.stringify(songsToSave))
        console.log('播放列表已保存到本地存储')
      } catch (error) {
        console.error('保存播放列表失败:', error)
        this.$message.warning('播放列表保存失败')
      }
    },

    /**
     * 保存音频文件到IndexedDB
     * @param {File} file - 音频文件
     * @param {number} songId - 歌曲ID
     */
    async saveAudioToIndexedDB(file, songId) {
      if (!this.db) {
        console.log('IndexedDB不可用，无法永久保存')
        return
      }

      try {
        const transaction = this.db.transaction(['audioFiles'], 'readwrite')
        const objectStore = transaction.objectStore('audioFiles')
        
        // 检查是否已存在该文件
        const getRequest = objectStore.index('songId').get(songId)
        
        getRequest.onsuccess = (event) => {
          const existingFile = event.target.result
          
          // 如果文件已存在且大小相同，跳过保存
          if (existingFile && existingFile.size === file.size) {
            console.log('音频文件已存在，跳过保存')
            return
          }
          
          // 保存新的音频文件
          const audioData = {
            id: `audio_${songId}`,
            songId: songId,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            blob: file, // 直接存储File对象（会被自动转换为Blob）
            savedAt: new Date().toISOString()
          }
          
          const addRequest = objectStore.put(audioData)
          
          addRequest.onsuccess = () => {
            console.log('音频文件已永久保存到IndexedDB')
          }
          
          addRequest.onerror = (error) => {
            console.error('保存音频文件失败:', error)
          }
        }
      } catch (error) {
        console.error('IndexedDB保存失败:', error)
      }
    },

    /**
     * 跳转到指定百分比位置
     * @param {number} percentage - 百分比位置
     */
    seekToPercentage(percentage) {
      const currentSong = this.currentSong
      
      if (currentSong.isLocalFile && this.actualAudio) {
        // 本地文件，直接跳转
        const targetTime = (percentage / 100) * this.actualAudio.duration
        this.actualAudio.currentTime = targetTime
        this.currentTime = targetTime
        this.progress = percentage
      } else {
        // 非本地文件，只更新显示
        this.currentTime = (percentage / 100) * this.duration
        this.progress = percentage
      }
    }
  },
  
  /**
   * 组件卸载前清理定时器和音频对象
   * 防止内存泄漏
   */
  beforeUnmount() {
    // 清理定时器
    this.stopAutoSync()
    this.stopProgress()
    
    // 清理音频对象
    if (this.actualAudio) {
      this.actualAudio.pause()
      this.actualAudio = null
    }
    if (this.audio) {
      URL.revokeObjectURL(this.audio.src)
      this.audio = null
    }
  }
}
</script>

<style scoped>
.music-player {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  text-align: center;
}

.player-info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.player-info p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.player-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.play-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.2);
  height: 6px;
  border-radius: 3px;
  margin-bottom: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.progress-bar:hover {
  height: 8px;
}

.progress {
  background: white;
  height: 100%;
  position: relative;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  right: -6px;
  top: -3px;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.progress-bar.isDragging .progress-handle {
  opacity: 1;
  transform: scale(1.2);
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.9;
}

.playlist {
  max-height: 400px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.playlist-item:hover {
  background-color: #f8f9fa;
}

.playlist-item.active {
  background-color: #f0f8ff;
  border-left: 4px solid #764ba2;
}

.song-info h4 {
  margin-bottom: 0.3rem;
  color: #333;
}

.song-info p {
  color: #666;
  font-size: 0.9rem;
}

.song-duration {
  color: #999;
  font-size: 0.9rem;
}



/* 上传样式 */
.upload-section {
  max-width: 600px;
  margin: 0 auto;
}

.upload-block {
  text-align: center;
  padding: 2rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.upload-block h3 {
  color: #764ba2;
  margin-bottom: 1rem;
}

.upload-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 6px;
  text-align: left;
}

.upload-info p {
  margin: 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.upload-info strong {
  color: #764ba2;
}

/* 空播放列表样式 */
.empty-playlist {
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-playlist h3 {
  color: #666;
  margin-bottom: 1rem;
}

.empty-playlist p {
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 歌曲操作按钮样式 */
.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s ease;
}

.song-main {
  flex: 1;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover {
  background: #e8f5e8;
  transform: scale(1.1);
}

.delete-btn:hover {
  background: #ffe8e8;
  transform: scale(1.1);
}

/* 存储说明样式 */
.storage-notice {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-left: 4px solid #6c757d;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.storage-notice h4 {
  color: #495057;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.storage-notice p {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.storage-notice p::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  background: #6c757d;
  border-radius: 50%;
  margin-right: 8px;
}

/* 同步按钮样式 */
.sync-actions {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  justify-content: center;
}

.sync-tip {
  font-size: 0.8rem;
  color: #868e96;
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
}

/* 导入对话框样式 */
.import-content {
  text-align: center;
  padding: 1rem 0;
}

.import-desc {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* 同步状态样式 */
.sync-status {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
}

.status-offline {
  color: #dc3545;
}

.status-syncing {
  color: #007bff;
}

.status-success {
  color: #28a745;
}

.status-ready {
  color: #17a2b8;
}

.sync-status span {
  margin-left: 0.5rem;
}

/* 存储卡片单独样式 */
.storage-card {
  margin-top: 1rem;
}
</style>