import { ListErrors } from "../shared/ListErrors.js";
import { formFields, ChangeFieldFromTarget } from "../shared/formFields.js";
import { html } from "../shared/html.js";
import { errorsList } from "../shared/selectors.js";
import { preventDefault, OnEnter } from "../shared/lib/events.js";
import { Http } from "../web_modules/@kwasniew/hyperapp-fx.js";
import { API_ROOT } from "../config.js";
import {FormError, RedirectAction} from "../shared/formFields.js";
import {HOME} from "../shared/pages.js";

const AddTag = state => [
  { ...state, currentTag: "", tagList: [...state.tagList, state.currentTag] },
  preventDefault
];

const RemoveTag = tag => state => ({
  ...state,
  tagList: state.tagList.filter(t => t !== tag)
});

const SaveArticle = ({ article, token }) =>
  Http({
    url: API_ROOT + "/articles",
    options: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`
      },
      body: JSON.stringify({ article })
    },
    errorResponse: "json",
    action: RedirectAction(HOME),
    error: FormError
  });

const SubmitArticle = state => [
  { ...state, inProgress: true },
  [
    preventDefault,
    SaveArticle({
      article: {
        title: state.title,
        description: state.description,
        body: state.body,
        tagList: state.tagList
      },
      token: state.user.token
    })
  ]
];

export const LoadEditorPage = page => state => {
  return {
    page,
    user: state.user,
    ...formFields,
    title: "",
    description: "",
    body: "",
    currentTag: "",
    tagList: []
  };
};

export const EditorPage = ({
  title,
  description,
  body,
  currentTag,
  tagList,
  errors,
  inProgress
}) => html`
  <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          ${ListErrors({ errors: errorsList({ errors }) })}

          <form>
            <fieldset>
              <fieldset class="form-group">
                <input
                  class="form-control form-control-lg"
                  type="text"
                  placeholder="Article Title"
                  value=${title}
                  oninput=${ChangeFieldFromTarget("title")}
                />
              </fieldset>

              <fieldset class="form-group">
                <input
                  class="form-control"
                  type="text"
                  placeholder="What's this article about?"
                  value=${description}
                  oninput=${ChangeFieldFromTarget("description")}
                />
              </fieldset>

              <fieldset class="form-group">
                <textarea
                  class="form-control"
                  rows="8"
                  placeholder="Write your article (in markdown)"
                  value=${body}
                  oninput=${ChangeFieldFromTarget("body")}
                />
              </fieldset>

              <fieldset class="form-group">
                <input
                  class="form-control"
                  type="text"
                  placeholder="Enter tags"
                  value=${currentTag}
                  onkeyup=${OnEnter(AddTag)}
                  oninput=${ChangeFieldFromTarget("currentTag")}
                />

                <div class="tag-list">
                  ${tagList.map(
                    tag =>
                      html`
                        <span class="tag-default tag-pill">
                          <i
                            class="ion-close-round"
                            onclick=${RemoveTag(tag)}
                          />
                          ${tag}
                        </span>
                      `
                  )}
                </div>
              </fieldset>

              <button
                class="btn btn-lg pull-xs-right btn-primary"
                type="button"
                disabled=${inProgress}
                onclick=${SubmitArticle}
              >
                Publish Article
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
`;
