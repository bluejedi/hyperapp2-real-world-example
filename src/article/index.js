import { html } from "../shared/html.js";
import markdown from "../web_modules/snarkdown.js";
import { Http } from "../web_modules/@kwasniew/hyperapp-fx.js";
import { API_ROOT } from "../config.js";
import { authHeader } from "../shared/authHeader.js";
import { profile, editor, LOGIN, REGISTER } from "../shared/pages.js";
import { format } from "../shared/date.js";
import { LogError } from "../shared/errors.js";

const SetArticle = (state, { article }) => ({ ...state, ...article });

const FetchArticle = ({ slug, token }) => {
  return Http({
    url: API_ROOT + "/articles/" + slug,
    options: { headers: authHeader(token) },
    action: SetArticle,
    error: LogError
  });
};

const SetComments = (state, { comments }) => ({ ...state, comments });

const FetchComments = ({ slug, token }) => {
  return Http({
    url: API_ROOT + "/articles/" + slug + "/comments",
    options: { headers: authHeader(token) },
    action: SetComments,
    error: LogError
  });
};

export const LoadArticlePage = page => (state, { slug }) => {
  const newState = {
    page,
    user: state.user,
    body: "",
    author: {},
    tagList: [],
    commentText: ""
  };
  return [
    newState,
    [
      FetchArticle({ slug, token: state.user.token }),
      FetchComments({ slug, token: state.user.token })
    ]
  ];
};

const canModifySelector = state =>
  state.user.token && state.author.username === state.user.username;

const ArticleActions = ({ state }) => {
  const canModify = canModifySelector(state);
  return canModify
    ? html`
        <span>
          <a
            href=${editor(state.slug)}
            class="btn btn-outline-secondary btn-sm"
          >
            <i class="ion-edit" /> Edit Article
          </a>

          <button class="btn btn-outline-danger btn-sm">
            <i class="ion-trash-a" /> Delete Article
          </button>
        </span>
      `
    : html`
        <span />
      `;
};

const ArticleMeta = ({ state }) => html`
  <div class="article-meta">
    <a href=${profile(state.author.username)}>
      <img src=${state.author.image} />
    </a>

    <div class="info">
      <a href=${profile(state.author.username)} class="author">
        ${state.author.username}
      </a>
      <span class="date">${format(state.createdAt)}</span>
    </div>

    ${ArticleActions({ state })}
  </div>
`;

const ArticleBanner = ({ state }) =>
  html`
    <div class="banner">
      <div class="container">
        <h1>${state.title}</h1>
        ${ArticleMeta({ state })}
      </div>
    </div>
  `;

const CommentInput = ({ state }) => html`
  <form class="card comment-form">
    <div class="card-block">
      <textarea
        class="form-control"
        placeholder="Write a comment..."
        value=${state.commentText}
        rows="3"
      />
    </div>
    <div class="card-footer">
      ${state.user.image
        ? html`
            <img
              src=${state.user.image}
              class="comment-author-img"
              alt=${state.user.username}
            />
          `
        : ""}
      <button class="btn btn-sm btn-primary" type="submit">
        Post Comment
      </button>
    </div>
  </form>
`;

const CommentContainer = ({ state }) => html`
  <div class="col-xs-12 col-md-8 offset-md-2">
    ${state.user.token
      ? html`
          <div>
            ${CommentInput({state})}
          </div>
        `
      : html`
          <p>
            <a href=${LOGIN}>Sign in</a>
            &nbsp;or&nbsp;
            <a href=${REGISTER}>sign up</a>
            &nbsp;to add comments on this article.
          </p>
        `}

  </div>
`;

export const ArticlePage = state =>
  state.title
    ? html`
        <div class="article-page">
          ${ArticleBanner({ state })}

          <div class="container page">
            <div class="row article-content">
              <div class="col-xs-12">
                <div innerHTML=${markdown(state.body)} />

                <ul class="tag-list">
                  ${state.tagList.map(
                    tag => html`
                      <li class="tag-default tag-pill tag-outline">
                        ${tag}
                      </li>
                    `
                  )}
                </ul>
              </div>
            </div>

            <hr />

            <div class="article-actions" />

            <div class="row">
              ${CommentContainer({ state })}
            </div>
          </div>
        </div>
      `
    : "";
