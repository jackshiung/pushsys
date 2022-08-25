import { APIResult } from '../models/network.model'
import { axiosInstance } from "./network";
export class ShareSvc {

  /**
   * 取得 Line 樣板
   * @path /api/v1/share/:code
   */
  async getTemplateByShareCode(code: string, trace: number = 0): Promise<APIResult<{ data: any }>> {
    const response = await axiosInstance.get<APIResult<{ data: any }>>(`/share/${code}`, {
      params: {
        trace
      }
    })
    return response.data;
  }
}

