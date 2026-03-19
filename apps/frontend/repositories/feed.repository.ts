import axios, { AxiosInstance } from 'axios'
import { PostItem, FeedResponse, CommentItem, CreatePostRequest, CreateCommentRequest } from '@amalia/shared'

export class FeedRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/feed`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async getFeed(page: number = 1, limit: number = 20): Promise<FeedResponse> {
    const res = await this.client.get<FeedResponse>('/', { params: { page, limit } })
    return res.data
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 20): Promise<FeedResponse> {
    const res = await this.client.get<FeedResponse>(`/user/${userId}`, { params: { page, limit } })
    return res.data
  }

  async createPost(content: string, image?: File): Promise<PostItem> {
    const form = new FormData()
    form.append('content', content)
    if (image) form.append('image', image)
    const token = localStorage.getItem('token')
    const res = await axios.post<PostItem>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/feed`,
      form,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return res.data
  }

  async toggleLike(postId: string): Promise<{ liked: boolean }> {
    const res = await this.client.post<{ liked: boolean }>(`/${postId}/like`)
    return res.data
  }

  async deletePost(postId: string): Promise<void> {
    await this.client.delete(`/${postId}`)
  }

  async getComments(postId: string): Promise<CommentItem[]> {
    const res = await this.client.get<CommentItem[]>(`/${postId}/comments`)
    return res.data
  }

  async createComment(postId: string, content: string): Promise<CommentItem> {
    const res = await this.client.post<CommentItem>(`/${postId}/comments`, { content })
    return res.data
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.client.delete(`/comments/${commentId}`)
  }
}
