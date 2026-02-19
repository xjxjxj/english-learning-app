from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'words', views.WordViewSet, basename='word')
router.register(r'sentences', views.SentenceViewSet, basename='sentence')
router.register(r'grammar', views.GrammarViewSet, basename='grammar')
router.register(r'study-logs', views.StudyLogViewSet, basename='study-log')
router.register(r'study-goals', views.StudyGoalViewSet, basename='study-goal')

urlpatterns = [
    path('', include(router.urls)),
    # 仪表盘
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    # 统计数据
    path('stats/', views.StatisticsView.as_view(), name='stats'),
    # 复习项目
    path('review/', views.ReviewListView.as_view(), name='review-list'),
    # 搜索
    path('search/', views.SearchView.as_view(), name='search'),
    # 批量操作
    path('words/bulk-delete/', views.WordBulkDeleteView.as_view(), name='word-bulk-delete'),
    path('sentences/bulk-delete/', views.SentenceBulkDeleteView.as_view(), name='sentence-bulk-delete'),
    path('grammar/bulk-delete/', views.GrammarBulkDeleteView.as_view(), name='grammar-bulk-delete'),
]
