import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            戻る
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-slate-600">
            最終更新日: {new Date().toLocaleDateString('ja-JP')}
          </p>
        </div>

        {/* Content */}
        <div className="prose max-w-none space-y-6 text-slate-700">
          <section>
            <p className="leading-relaxed">
              届出管理システム（以下「当社」といいます）は、本サービスにおける個人情報の取扱いについて、
              以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第1条（収集する情報）
            </h2>
            <p className="leading-relaxed mb-2">
              当社は、本サービスの提供にあたり、以下の情報を収集します。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>ユーザー登録時に提供いただく情報（ユーザー名、メールアドレス等）</li>
              <li>本サービスの利用状況に関する情報（アクセスログ、IPアドレス等）</li>
              <li>届出書類に記載された情報</li>
              <li>その他、本サービスの利用に際して入力・送信された情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第2条（利用目的）
            </h2>
            <p className="leading-relaxed mb-2">
              当社は、収集した個人情報を以下の目的で利用します。
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>本サービスの提供、維持、改善のため</li>
              <li>ユーザーからの問い合わせへの対応のため</li>
              <li>利用規約違反への対応のため</li>
              <li>本サービスに関する重要なお知らせの配信のため</li>
              <li>サービスの品質向上および新機能開発のための統計データ分析のため</li>
              <li>その他、上記利用目的に付随する目的のため</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第3条（第三者提供）
            </h2>
            <p className="leading-relaxed mb-2">
              当社は、以下の場合を除き、個人情報を第三者に提供しません。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第4条（個人情報の安全管理）
            </h2>
            <p className="leading-relaxed">
              当社は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>アクセス制御による不正アクセスの防止</li>
              <li>通信の暗号化（SSL/TLS）</li>
              <li>定期的なセキュリティ監査の実施</li>
              <li>従業員への教育・研修の実施</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第5条（個人情報の開示・訂正・削除）
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>ユーザーは、当社に対し、個人情報保護法の定めに従い、自己の個人情報の開示を請求することができます。</li>
              <li>ユーザーは、個人情報の内容が事実でない場合、訂正または削除を請求することができます。</li>
              <li>当社は、前項の請求を受けた場合、遅滞なく必要な調査を行い、その結果に基づき、個人情報の訂正または削除を行います。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第6条（Cookie等の利用）
            </h2>
            <p className="leading-relaxed">
              当社は、本サービスの利便性向上およびサービス改善のため、Cookieおよび類似の技術を使用することがあります。
              ユーザーはブラウザの設定によりCookieの使用を拒否することができますが、
              その場合、本サービスの一部機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第7条（プライバシーポリシーの変更）
            </h2>
            <p className="leading-relaxed">
              当社は、必要に応じて、本ポリシーを変更することがあります。
              変更後のプライバシーポリシーは、本サービス上に掲示された時点から効力を生じるものとします。
              重要な変更については、サービス内で適切な方法により通知します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              第8条（お問い合わせ）
            </h2>
            <p className="leading-relaxed">
              本ポリシーに関するお問い合わせは、本サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              以上
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
