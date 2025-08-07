export interface CookpadRecipe {
  id: string
  title: string
  description: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  servings: string
  cookingTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  author: string
  rating: number
  reviews: number
  imageUrl?: string
}

export interface RecipeIngredient {
  name: string
  amount: string
  unit?: string
  notes?: string
}

export interface RecipeStep {
  stepNumber: number
  description: string
  duration?: string
  tips?: string
  imageUrl?: string
}

export class CookpadRecipeFetcher {
  private static instance: CookpadRecipeFetcher

  static getInstance(): CookpadRecipeFetcher {
    if (!CookpadRecipeFetcher.instance) {
      CookpadRecipeFetcher.instance = new CookpadRecipeFetcher()
    }
    return CookpadRecipeFetcher.instance
  }

  /**
   * クックパッドレシピURLからレシピ情報を取得
   */
  async fetchRecipe(url: string): Promise<CookpadRecipe> {
    try {
      // 実際の実装では、クックパッドのAPIまたはスクレイピングを使用
      // 現在はモックデータを使用
      return this.getMockRecipe(url)
    } catch (error) {
      console.error('Failed to fetch recipe:', error)
      throw new Error('レシピの取得に失敗しました')
    }
  }

  /**
   * レシピを動画スクリプト形式に変換
   */
  convertRecipeToVideoScript(recipe: CookpadRecipe, videoStyle: any): string {
    const script = {
      title: `${recipe.title}の作り方`,
      description: recipe.description,
      duration: this.calculateVideoDuration(recipe),
      scenes: this.generateVideoScenes(recipe, videoStyle),
      style: videoStyle.style,
      targetAudience: videoStyle.targetAudience,
      pacing: videoStyle.pacing,
      tone: videoStyle.tone
    }

    return JSON.stringify(script, null, 2)
  }

  /**
   * 動画の長さを計算
   */
  private calculateVideoDuration(recipe: CookpadRecipe): string {
    const baseTimePerStep = 15 // 秒
    const totalSteps = recipe.steps.length
    const totalSeconds = totalSteps * baseTimePerStep + 30 // 導入とまとめで30秒追加
    
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * 動画シーンを生成
   */
  private generateVideoScenes(recipe: CookpadRecipe, videoStyle: any): any[] {
    const scenes = []

    // 導入シーン
    scenes.push({
      id: 'intro',
      title: '導入',
      description: `${recipe.title}の作り方を紹介します`,
      duration: 10,
      visualElements: ['タイトル表示', '材料の全体紹介'],
      audioElements: ['BGM', 'ナレーション'],
      cameraAngle: 'medium shot'
    })

    // 材料紹介シーン
    scenes.push({
      id: 'ingredients',
      title: '材料紹介',
      description: '必要な材料を詳しく紹介します',
      duration: 20,
      visualElements: ['材料の個別紹介', '分量の表示'],
      audioElements: ['ナレーション', '効果音'],
      cameraAngle: 'close-up'
    })

    // 手順シーン
    recipe.steps.forEach((step, index) => {
      scenes.push({
        id: `step-${index + 1}`,
        title: `手順${index + 1}`,
        description: step.description,
        duration: 15,
        visualElements: ['手順の詳細', 'テロップ表示'],
        audioElements: ['ナレーション', '効果音'],
        cameraAngle: 'medium shot',
        tips: step.tips
      })
    })

    // 完成シーン
    scenes.push({
      id: 'completion',
      title: '完成',
      description: '完成した料理の紹介',
      duration: 15,
      visualElements: ['完成品の紹介', '盛り付け'],
      audioElements: ['BGM', 'ナレーション'],
      cameraAngle: 'wide shot'
    })

    return scenes
  }

  /**
   * モックレシピデータを取得
   */
  private getMockRecipe(url: string): CookpadRecipe {
    return {
      id: '18940899',
      title: '☆絶品餃子☆',
      description: 'やっぱりこの味が一番美味しい！！簡単な絶品餃子＊＊',
      ingredients: [
        { name: '豚ひき肉', amount: '220', unit: 'g' },
        { name: 'きゃべつ', amount: '140', unit: 'g' },
        { name: 'にら', amount: '1/3', unit: '束' },
        { name: '長ねぎ', amount: '1/2', unit: '本' },
        { name: 'にんにくすりおろし', amount: '1', unit: 'かけ' },
        { name: 'しょうがすりおろし', amount: 'にんにくと同量' },
        { name: '酒（紹興酒）', amount: '2', unit: '大さじ' },
        { name: 'ごま油', amount: '1', unit: '大さじ' },
        { name: '醤油', amount: '1', unit: '小さじ' },
        { name: '鶏がらスープのもと', amount: '1', unit: '小さじ' },
        { name: 'ねぎ油', amount: '1', unit: '小さじ' },
        { name: '砂糖', amount: '1/2', unit: '小さじ' },
        { name: '塩こしょう', amount: '少々' },
        { name: '餃子の皮', amount: '40', unit: '枚' }
      ],
      steps: [
        {
          stepNumber: 1,
          description: 'ひき肉に●の調味料を加えてよく混ぜる',
          duration: '5分',
          tips: '粘りが出るまでしっかり混ぜることがポイント'
        },
        {
          stepNumber: 2,
          description: 'きゃべつをみじん切りにして塩を加えてしばらく置く',
          duration: '10分',
          tips: '水分が出るのでしっかり絞る'
        },
        {
          stepNumber: 3,
          description: 'にらと長ねぎをみじん切りにする',
          duration: '3分',
          tips: '細かく切ることで食感が良くなる'
        },
        {
          stepNumber: 4,
          description: 'きゃべつの水分を絞って、他の材料と混ぜる',
          duration: '5分',
          tips: '均等に混ざるように注意'
        },
        {
          stepNumber: 5,
          description: '餃子の皮に具を包む',
          duration: '15分',
          tips: '具がはみ出さないように適量を入れる'
        },
        {
          stepNumber: 6,
          description: 'フライパンで焼く',
          duration: '8分',
          tips: '中火でじっくり焼く'
        }
      ],
      servings: '40個分（大判20個分）',
      cookingTime: '約30分',
      difficulty: 'medium',
      tags: ['餃子', '手作り', '簡単', '絶品'],
      author: '☆栄養士のれしぴ☆',
      rating: 4.8,
      reviews: 6700,
      imageUrl: 'https://example.com/gyoza-image.jpg'
    }
  }

  /**
   * レシピを動画制作用のプロンプトに変換
   */
  generateVideoPrompt(recipe: CookpadRecipe, videoAnalysis: any): string {
    return `
以下のクックパッドレシピを参考に、YouTube動画と同じスタイルで動画を制作してください：

【参考動画】
- タイトル: ${videoAnalysis.title}
- スタイル: ${videoAnalysis.style}
- ペーシング: ${videoAnalysis.pacing}
- トーン: ${videoAnalysis.tone}
- 視覚要素: ${videoAnalysis.visualElements.join(', ')}
- 音声要素: ${videoAnalysis.audioElements.join(', ')}

【レシピ情報】
- タイトル: ${recipe.title}
- 説明: ${recipe.description}
- 材料数: ${recipe.ingredients.length}個
- 手順数: ${recipe.steps.length}ステップ
- 調理時間: ${recipe.cookingTime}
- 難易度: ${recipe.difficulty}

【動画制作指示】
1. 参考動画と同じスタイルとペーシングで制作
2. 材料の紹介から始める
3. 各手順を分かりやすく解説
4. 完成品の紹介で終わる
5. 視覚的にも音声的にも魅力的な動画にする

この内容を基に、mulmocastで動画制作を開始してください。
`
  }
}

// シングルトンインスタンスをエクスポート
export const cookpadRecipeFetcher = CookpadRecipeFetcher.getInstance() 