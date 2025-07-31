import 'package:flutter/material.dart';

class AssetPanel extends StatefulWidget {
  final Function(String) onAssetSelect;

  const AssetPanel({super.key, required this.onAssetSelect});

  @override
  State<AssetPanel> createState() => _AssetPanelState();
}

class _AssetPanelState extends State<AssetPanel> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<Map<String, dynamic>> assets = [
    {'id': '1', 'type': 'video', 'name': 'intro.mp4', 'thumbnail': 'assets/placeholders/video.jpg'},
    {'id': '2', 'type': 'image', 'name': 'slide1.png', 'thumbnail': 'assets/placeholders/image.jpg'},
    {'id': '3', 'type': 'document', 'name': 'script.pdf', 'thumbnail': 'assets/placeholders/document.jpg'},
    {'id': '4', 'type': 'audio', 'name': 'narration.mp3', 'thumbnail': 'assets/placeholders/audio.jpg'},
    {'id': '5', 'type': 'youtube', 'name': '参考動画', 'thumbnail': 'assets/placeholders/youtube.jpg'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      decoration: BoxDecoration(
        border: Border(
          right: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // アセットヘッダー
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: Theme.of(context).dividerColor,
                  width: 1,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'アセット',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.upload, size: 16),
                    label: const Text('アップロード'),
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: Colors.white70,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      side: BorderSide(color: Theme.of(context).dividerColor),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // タブバー
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'すべて'),
              Tab(text: '動画'),
              Tab(text: '画像'),
              Tab(text: '音声'),
            ],
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white60,
            indicatorColor: Theme.of(context).primaryColor,
            indicatorSize: TabBarIndicatorSize.tab,
          ),

          // タブコンテンツ
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // すべてのアセット
                _buildAssetGrid(assets),
                
                // 動画アセット
                _buildAssetGrid(assets.where((asset) => asset['type'] == 'video').toList()),
                
                // 画像アセット
                _buildAssetGrid(assets.where((asset) => asset['type'] == 'image').toList()),
                
                // 音声アセット
                _buildAssetGrid(assets.where((asset) => asset['type'] == 'audio').toList()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAssetGrid(List<Map<String, dynamic>> assetList) {
    return GridView.builder(
      padding: const EdgeInsets.all(8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 0.8,
      ),
      itemCount: assetList.length,
      itemBuilder: (context, index) {
        final asset = assetList[index];
        return GestureDetector(
          onTap: () => widget.onAssetSelect(asset['id']),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Stack(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF27272A), // zinc-800
                        borderRadius: BorderRadius.circular(4),
                      ),
                      width: double.infinity,
                      child: Center(
                        child: Icon(
                          _getIconForType(asset['type']),
                          size: 24,
                          color: Colors.white54,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          _getIconForType(asset['type']),
                          size: 12,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                asset['name'],
                style: const TextStyle(fontSize: 12),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'video':
        return Icons.videocam_outlined;
      case 'image':
        return Icons.image_outlined;
      case 'document':
        return Icons.description_outlined;
      case 'audio':
        return Icons.music_note_outlined;
      case 'youtube':
        return Icons.play_circle_outline;
      default:
        return Icons.insert_drive_file_outlined;
    }
  }
}
